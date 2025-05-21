import prisma from "../../src/database";
import { faker } from "@faker-js/faker";

export async function getEventId(){
    const events = await prisma.event.findMany();

    const id = events[0].id;

    return id
}

export async function generateTicketsData(){
    const ticketsPurchases = [];

    const result = await prisma.event.findMany();

    const ids = result.map(e => e.id)

    for(let i=0; i < ids.length; i++){
        ticketsPurchases.push({
            code:faker.string.alphanumeric(5),
            owner:faker.person.firstName(),
            eventId: ids[i]
        })
    }

    return ticketsPurchases
}

export async function createPurchases(){
    const tickets = await generateTicketsData();

    await prisma.ticket.createMany({
        data:
            tickets.map(purchase => purchase)
    })
}

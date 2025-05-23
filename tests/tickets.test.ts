import supertest from "supertest";
import app from "../src/app";
import prisma from  "../src/database";
import { faker } from "@faker-js/faker";
import { createPurchases } from "./factories/tickets-factory";
import { createEvents } from "./factories/events-factory";

const api = supertest(app);

beforeEach(async () => {
    await prisma.event.deleteMany();
})

describe("GET /tickets/:eventId", () => {
    it("should return all tickets given an eventId", async () => {
        
        const events = await createEvents(3);
        const eventId = events[0].id

        await createPurchases();

        const { status, body } = await api.get(`/tickets/${eventId}`);

        expect(status).toBe(200);

        expect(body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id:expect.any(Number),
                    code:expect.any(String),
                    owner:expect.any(String),
                    eventId:expect.any(Number)

                })
            ])
        )
    })
})

describe("POST /tickets", () => {
    it("should create a ticket purchase and return status 201", async () => {
        
        const events = await createEvents(3);
        const eventId = events[0].id

        const data = {
            code:faker.string.alphanumeric(5),
            owner:faker.person.firstName(),
            eventId:eventId
        }

        const { status, body } = await api.post("/tickets").send(data);
     
        expect(status).toBe(201);

        const existentTicket = await prisma.ticket.findUnique({
            where: { id : body.id}
        })

        expect(existentTicket).not.toBeNull();

    })

    it("should return the status 403 and a message", async () => {

        const result = await prisma.event.create({
            data:{
                name:faker.company.name(),
                date:faker.date.past()
            }
        });

        const ticketData = {
            code:faker.string.alphanumeric(5),
            owner:faker.person.firstName(),
            eventId:result.id
        }

        const { status, text } = await api.post("/tickets").send(ticketData);

        expect(status).toBe(403);

        expect(text).toBe(`The event has already happened.`);      
    })

    it("should return a message and the status 409", async () => {
        const result = await prisma.event.create({
            data:{
                name:faker.company.name(),
                date:faker.date.future()
            }
        });

        const ticketData = await prisma.ticket.create({
            data: {
                code:faker.string.alphanumeric(5),
                owner:faker.person.firstName(),
                eventId:result.id
            }
        });

        const ticketDataConflict = {
            code: ticketData.code,
            owner: ticketData.owner,
            eventId:result.id
        }

        const { status, text } = await api.post("/tickets").send(ticketDataConflict);

        expect(status).toBe(409);
        expect(text).toBe(`Ticket with code ${ticketData.code} for event id ${result.id} already registered.`)
    })
})

describe("PUT /tickets/use/:id", () => {
    it("should update a ticket purchase to used and return status 204", async () => {       
        
        const events = await createEvents(3);
        const eventId = events[0].id

        const data = await prisma.ticket.create({
            data:{
                code:faker.string.alphanumeric(5),
                owner:faker.person.firstName(),
                eventId: eventId
           }
        })
  
        const id = data.id
       
        const { status } = await api.put(`/tickets/use/${id}`);
        
        expect(status).toBe(204);

        const updated = await prisma.ticket.findUnique({
            where: { id: id }
        })

        expect(updated).not.toBeNull();

    })

    it("should return a message and the status 403", async () => {
        const events = await createEvents(3);
        const eventId = events[0].id

        const data = await prisma.ticket.create({
            data:{
                code:faker.string.alphanumeric(5),
                owner:faker.person.firstName(),
                eventId: eventId
           }
        });
  
        const id = data.id
       
        await api.put(`/tickets/use/${id}`);

        const { status, text } = await api.put(`/tickets/use/${id}`);

        expect(status).toBe(403);
        expect(text).toBe(`The event has already happened or ticket was already used.`)
    })
})
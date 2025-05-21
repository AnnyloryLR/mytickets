import supertest from "supertest";
import app from "../src/app";
import prisma from  "../src/database";
import { faker } from "@faker-js/faker";
import { createPurchases, getEventId } from "./factories/tickets-factory";
import { createEvents } from "./factories/events-factory";

const api = supertest(app);

beforeEach(async () => {
    await prisma.event.deleteMany();
})

describe("GET /tickets/:eventId", () => {
    it("should return all tickets given an eventId", async () => {
        await createEvents(3);
        const id = await getEventId();

        await createPurchases();

        const { status, body } = await api.get(`/tickets/${id}`);

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
        await createEvents(3);

        const eventId = await getEventId();

        const data = {
            code:faker.string.alphanumeric(5),
            owner:faker.person.firstName(),
            eventId
        }

        const { status, body } = await api.post("/tickets").send(data);
     
        expect(status).toBe(201);

        const existentTicket = await prisma.ticket.findUnique({
            where: { id : body.id}
        })

        expect(existentTicket).not.toBeNull();

    })
})

describe("PUT /tickets/use/:id", () => {
    it("should update a ticket purchase to used and return status 204", async () => {
        await createEvents(3);

        const eventId = await getEventId();

        const data = await prisma.ticket.create({
            data:{
                code:faker.string.alphanumeric(5),
                owner:faker.person.firstName(),
                eventId
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
})
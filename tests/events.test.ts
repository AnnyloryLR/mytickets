import supertest from "supertest";
import app from "../src/app";
import prisma from "../src/database";
import { createEvents, generateEventBody } from "./factories/events-factory";
import { getEventId } from "./factories/tickets-factory";

const api = supertest(app);

beforeEach(async () => {
    await prisma.event.deleteMany();
})

describe("GET /events", () => {
    it("should return all events",
        async () => {
        await createEvents(3);


        const { status, body } = await api.get("/events");

        expect(status).toBe(200);
        expect(body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id:expect.any(Number),
                    name:expect.any(String),
                    date:expect.any(String)
                })
            ])
        )
        
        
    })
})

describe("GET /events/:id", () => {
    it("should return a specific event giving an id", async () => {
        await createEvents(3);
        const id = await getEventId();
        
        const { status, body } = await api.get(`/events/${id}`)

        expect(status).toBe(200);
        expect(body).toEqual(
            expect.objectContaining({
                    id:expect.any(Number),
                    name:expect.any(String),
                    date:expect.any(String)
                })
        )   
    })
})

describe("POST /events", () => {
    it("should create a event and return the status 201", async () => {
        const data = generateEventBody();

        const { status } = await api.post("/events").send(data);

        expect(status).toBe(201);

        const existentEvent = await prisma.event.findUnique({
            where: { name: data.name }
        });

        expect(existentEvent).not.toBeNull();

    })
})

describe("PUT /events/:id", () => {
    it("should update a event given an id and return the status 204",
        async () => { 
            const data = await prisma.event.create({
                data:{        
                    name: "driven",
                    date: new Date("2025-07-11")
                }
            });

            const {id} = data;
          
            const update = { 
                name: "driven",
                date: new Date("2025-09-11")

            }

            const { status } = await api.put(`/events/${id}`).send(update);

            expect(status).toBe(200);

            const updated = await prisma.event.findUnique({
                where: { name: update.name }
            });

            expect(updated).not.toBeNull();

        })
})

describe("DELETE /events/:id", () => {
    it("should update a event given an id and return the status 204",
        async () => {
            const data = await createEvents(3);
             console.log(data)

            const id = data[0].id;        

            const { status } = await api.delete(`/events/${id}`);

            expect(status).toBe(204);

            const deleted = await prisma.event.findUnique({
                where: { name: data[0].name }
            });

            expect(deleted).toBeNull();

    })
})
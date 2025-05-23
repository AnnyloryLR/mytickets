import supertest from "supertest";
import app from "../src/app";
import prisma from "../src/database";
import { faker } from "@faker-js/faker"
import { createEvents, generateEventBody } from "./factories/events-factory";

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

    it("should return a specific event giving an id", async () => {
        
        const result = await createEvents(3);
        const id = result[0].id
        
        const { status, body } = await api.get(`/events/${id}`);

        expect(status).toBe(200);
        expect(body).toEqual(
            expect.objectContaining({
                    id:expect.any(Number),
                    name:expect.any(String),
                    date:expect.any(String)
                })
        )   
    })

    it("should return a message and the status 404", async ()=> {
        const result = await prisma.event.create({
            data:{
                name:faker.company.name(),
                date:faker.date.future()
            }
        });

        const id = result.id;

        await prisma.event.delete({
            where:{id:id}
        });

        const { status, text } = await api.get(`/events/${id}`);

        expect(status).toBe(404);
        expect(text).toBe(`Event with id ${id} not found.`)
    })
})

describe("POST /events", () => {
    it("should create a event and return the status 201", async () => {
        const data = generateEventBody();

        const { status, body } = await api.post("/events").send(data);

        expect(status).toBe(201);

        const existentEvent = await prisma.event.findUnique({
            where: { id: body.id }
        });

        expect(existentEvent).not.toBeNull();

    })

    it("should return a message and the status 409", async () => {
        const data = generateEventBody();

        await api.post("/events").send(data);

        const { status, text } = await api.post("/events").send(data);

        expect(status).toBe(409);
        expect(text).toBe(`Event with name ${data.name} already registered.`)

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
                where: { id:id }
            });

            expect(updated).not.toBeNull();

    })

    it("should return a message and the status 404", async ()=> {
        
        const data = await prisma.event.create({
                data:{        
                    name: "FLIP",
                    date: new Date("2025-07-11")
                }
            });

        const id = data.id;

        await prisma.event.delete({
            where:{id:id}
        });

        const update = { 
                name: "FLIP",
                date: new Date("2025-09-11")

        }

        const { status, text } = await api.put(`/events/${id}`).send(update);

        expect(status).toBe(404);
        expect(text).toBe(`Event with id ${id} not found.`)
    })
       
})

describe("DELETE /events/:id", () => {
    it("should update a event given an id and return the status 204",
        async () => {
            const data = await createEvents(3);

            const id = data[0].id;        

            const { status } = await api.delete(`/events/${id}`);

            expect(status).toBe(204);

            const deleted = await prisma.event.findUnique({
                where: { name: data[0].name }
            });

            expect(deleted).toBeNull();

    })
})


import supertest from "supertest";
import app from "../src/app";
import prisma from "../src/database";
import { createEvents } from "./factories/events-factory";

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

// describe("GET /events/:id", () => {
//     it("should return a specific event giving an id", async () => {

// })

// })
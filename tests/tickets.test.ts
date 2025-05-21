import supertest from "supertest";
import app from "../src/app";
import prisma from "../src/database";
import { createPurchases } from "./factories/tickets-factory";

const api = supertest(app);

async function getEventId(){
    const events = await prisma.event.findMany();

    const id = events[0].id;

    return id
}

describe("GET /tickets/:eventId", () => {
    it("should return all tickets given an eventId", async () => {
       const id = await getEventId()

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
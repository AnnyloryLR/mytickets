import supertest from "supertest";
import app from "../src/app";
import prisma from  "../src/database"
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
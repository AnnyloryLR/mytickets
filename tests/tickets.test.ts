import supertest from "supertest";
import app from "../src/app";
import { createPurchases } from "./factories/tickets-factory";

const api = supertest(app);

describe("GET /tickets/:eventId", () => {
    it("should return all tickets given an eventId", async () => {
        await createPurchases();

        const { status, body } = await api.get("/tickets/30");

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
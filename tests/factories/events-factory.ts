import prisma from "../../src/database";
import { faker } from "@faker-js/faker";

export function generateEventBody(){
    return{
        name: faker.company.name(),
        date: faker.date.future()
    }
}

export function generateEvents(numberOfEvents:number){
    const events = [];

    for(let i=0; i < numberOfEvents; i++){
        events.push({name:faker.company.name(),
                     date:faker.date.future()});
    }

    return events;
}

export async function createEvents(numberOfEvents: number){
    const eventsData = generateEvents(numberOfEvents);

    const events = await prisma.event.createManyAndReturn({
        data:
            eventsData.map(e => { return {
                name: e.name,
                date:e.date,
            }})
    })

    return events;
}

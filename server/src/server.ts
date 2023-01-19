import Fastify from "fastify";
import cors from '@fastify/cors'
import { prisma } from "@prisma/client";
import { appRoutes } from "./route";


const app = Fastify()

app.register(cors)
app.register(appRoutes)

app.listen({
    port: 3333,
}).then(() => {
    console.log('HTTP Server running!')
})
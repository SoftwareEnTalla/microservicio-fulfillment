/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 * CEOs: 
 *       Persy Morell Guerra      Email: pmorellpersi@gmail.com  Phone : +53-5336-4654 Linkedin: https://www.linkedin.com/in/persy-morell-guerra-288943357/
 *       Dailyn García Domínguez  Email: dailyngd@gmail.com      Phone : +53-5432-0312 Linkedin: https://www.linkedin.com/in/dailyn-dominguez-3150799b/
 *
 * CTO: Persy Morell Guerra
 * COO: Dailyn García Domínguez and Persy Morell Guerra
 * CFO: Dailyn García Domínguez and Persy Morell Guerra
 *
 * Repositories: 
 *               https://github.com/SoftwareEnTalla 
 *
 *               https://github.com/apokaliptolesamale?tab=repositories
 *
 *
 * Social Networks:
 *
 *              https://x.com/SoftwarEnTalla
 *
 *              https://www.facebook.com/profile.php?id=61572625716568
 *
 *              https://www.instagram.com/softwarentalla/
 *              
 *
 *
 */


import { Module } from "@nestjs/common";
import { FulfillmentCommandController } from "../controllers/fulfillmentcommand.controller";
import { FulfillmentQueryController } from "../controllers/fulfillmentquery.controller";
import { FulfillmentCommandService } from "../services/fulfillmentcommand.service";
import { FulfillmentQueryService } from "../services/fulfillmentquery.service";

import { FulfillmentCommandRepository } from "../repositories/fulfillmentcommand.repository";
import { FulfillmentQueryRepository } from "../repositories/fulfillmentquery.repository";
import { FulfillmentRepository } from "../repositories/fulfillment.repository";
import { FulfillmentResolver } from "../graphql/fulfillment.resolver";
import { FulfillmentAuthGuard } from "../guards/fulfillmentauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Fulfillment } from "../entities/fulfillment.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateFulfillmentHandler } from "../commands/handlers/createfulfillment.handler";
import { UpdateFulfillmentHandler } from "../commands/handlers/updatefulfillment.handler";
import { DeleteFulfillmentHandler } from "../commands/handlers/deletefulfillment.handler";
import { GetFulfillmentByIdHandler } from "../queries/handlers/getfulfillmentbyid.handler";
import { GetFulfillmentByFieldHandler } from "../queries/handlers/getfulfillmentbyfield.handler";
import { GetAllFulfillmentHandler } from "../queries/handlers/getallfulfillment.handler";
import { FulfillmentCrudSaga } from "../sagas/fulfillment-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { FulfillmentInterceptor } from "../interceptors/fulfillment.interceptor";
import { FulfillmentLoggingInterceptor } from "../interceptors/fulfillment.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, Fulfillment]), // Incluir BaseEntity para herencia
    CacheModule.registerAsync({
      useFactory: async () => {
        try {
          const store = await redisStore({
            socket: { host: process.env.REDIS_HOST || "data-center-redis", port: parseInt(process.env.REDIS_PORT || "6379", 10) },
            ttl: parseInt(process.env.REDIS_TTL || "60", 10),
          });
          return { store: store as any, isGlobal: true };
        } catch {
          return { isGlobal: true }; // fallback in-memory
        }
      },
    }),
  ],
  controllers: [FulfillmentCommandController, FulfillmentQueryController],
  providers: [
    //Services
    EventStoreService,
    FulfillmentQueryService,
    FulfillmentCommandService,
  
    //Repositories
    FulfillmentCommandRepository,
    FulfillmentQueryRepository,
    FulfillmentRepository,      
    //Resolvers
    FulfillmentResolver,
    //Guards
    FulfillmentAuthGuard,
    //Interceptors
    FulfillmentInterceptor,
    FulfillmentLoggingInterceptor,
    //CQRS Handlers
    CreateFulfillmentHandler,
    UpdateFulfillmentHandler,
    DeleteFulfillmentHandler,
    GetFulfillmentByIdHandler,
    GetFulfillmentByFieldHandler,
    GetAllFulfillmentHandler,
    FulfillmentCrudSaga,
    //Configurations
    {
      provide: 'EVENT_SOURCING_CONFIG',
      useFactory: () => ({
        enabled: process.env.EVENT_SOURCING_ENABLED !== 'false',
        kafkaEnabled: process.env.KAFKA_ENABLED !== 'false',
        eventStoreEnabled: process.env.EVENT_STORE_ENABLED === 'true',
        publishEvents: true,
        useProjections: true,
        topics: EVENT_TOPICS
      })
    },
  ],
  exports: [
    CqrsModule,
    KafkaModule,
    //Services
    EventStoreService,
    FulfillmentQueryService,
    FulfillmentCommandService,
  
    //Repositories
    FulfillmentCommandRepository,
    FulfillmentQueryRepository,
    FulfillmentRepository,      
    //Resolvers
    FulfillmentResolver,
    //Guards
    FulfillmentAuthGuard,
    //Interceptors
    FulfillmentInterceptor,
    FulfillmentLoggingInterceptor,
  ],
})
export class FulfillmentModule {}


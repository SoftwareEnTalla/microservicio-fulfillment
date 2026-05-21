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


import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { DeleteResult, UpdateResult } from "typeorm";
import { Fulfillment } from "../entities/fulfillment.entity";
import { CreateFulfillmentDto, UpdateFulfillmentDto, DeleteFulfillmentDto } from "../dtos/all-dto";
 
import { generateCacheKey } from "src/utils/functions";
import { FulfillmentCommandRepository } from "../repositories/fulfillmentcommand.repository";
import { FulfillmentQueryRepository } from "../repositories/fulfillmentquery.repository";
import { Cacheable } from "../decorators/cache.decorator";
import { FulfillmentResponse, FulfillmentsResponse } from "../types/fulfillment.types";
import { Helper } from "src/common/helpers/helpers";
//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { CommandBus } from "@nestjs/cqrs";
import { EventStoreService } from "../shared/event-store/event-store.service";
import { KafkaEventPublisher } from "../shared/adapters/kafka-event-publisher";
import { ModuleRef } from "@nestjs/core";
import { FulfillmentQueryService } from "./fulfillmentquery.service";
import { BaseEvent } from "../events/base.event";
import { FulfillmentStartedEvent } from '../events/fulfillmentstarted.event';
import { PickTaskCreatedEvent } from '../events/picktaskcreated.event';
import { PackCompletedEvent } from '../events/packcompleted.event';
import { DispatchReadyEvent } from '../events/dispatchready.event';

@Injectable()
export class FulfillmentCommandService implements OnModuleInit {
  // Private properties
  readonly #logger = new Logger(FulfillmentCommandService.name);
  //Constructo del servicio FulfillmentCommandService
  constructor(
    private readonly repository: FulfillmentCommandRepository,
    private readonly queryRepository: FulfillmentQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly eventStore: EventStoreService,
    private readonly eventPublisher: KafkaEventPublisher,
    private moduleRef: ModuleRef
  ) {
    //Inicialice aquí propiedades o atributos
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(FulfillmentQueryService.name)
      .get(FulfillmentQueryService.name),
  })
  onModuleInit() {
    //Se ejecuta en la inicialización del módulo
  }

  private dslValue(entityData: Record<string, any>, currentData: Record<string, any>, inputData: Record<string, any>, field: string): any {
    return entityData?.[field] ?? currentData?.[field] ?? inputData?.[field];
  }

  private async publishDslDomainEvents(events: BaseEvent[]): Promise<void> {
    for (const event of events) {
      await this.eventPublisher.publish(event as any);
      if (process.env.EVENT_STORE_ENABLED === "true") {
        await this.eventStore.appendEvent('fulfillment-' + event.aggregateId, event);
      }
    }
  }

  private async applyDslServiceRules(
    operation: "create" | "update" | "delete",
    inputData: Record<string, any>,
    entity?: Fulfillment | null,
    current?: Fulfillment | null,
    publishEvents: boolean = true,
  ): Promise<void> {
    const entityData = ((entity ?? {}) as Record<string, any>);
    const currentData = ((current ?? {}) as Record<string, any>);
    const pendingEvents: BaseEvent[] = [];
    if (operation === 'update') {
      // Regla de servicio: dispatch-ready-requires-pack-complete
      // No se puede dejar listo para despacho un fulfillment sin packing completo.
      if (!(this.dslValue(entityData, currentData, inputData, 'packingStatus') === 'PACKED')) {
        throw new Error('FULFILLMENT_001: El packing debe estar completo antes del despacho');
      }

    }
    if (publishEvents) {
      await this.publishDslDomainEvents(pendingEvents);
    }
  }

  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(FulfillmentCommandService.name)
      .get(FulfillmentCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<CreateFulfillmentDto>("createFulfillment", args[0], args[1]),
    ttl: 60,
  })
  async create(
    createFulfillmentDtoInput: CreateFulfillmentDto
  ): Promise<FulfillmentResponse<Fulfillment>> {
    try {
      logger.info("Receiving in service:", createFulfillmentDtoInput);
      const candidate = Fulfillment.fromDto(createFulfillmentDtoInput);
      await this.applyDslServiceRules("create", createFulfillmentDtoInput as Record<string, any>, candidate, null, false);
      const entity = await this.repository.create(candidate);
      await this.applyDslServiceRules("create", createFulfillmentDtoInput as Record<string, any>, entity, null, true);
      logger.info("Entity created on service:", entity);
      // Respuesta si el fulfillment no existe
      if (!entity)
        throw new NotFoundException("Entidad Fulfillment no encontrada.");
      // Devolver fulfillment
      return {
        ok: true,
        message: "Fulfillment obtenido con éxito.",
        data: entity,
      };
    } catch (error) {
      logger.info("Error creating entity on service:", error);
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(FulfillmentCommandService.name)
      .get(FulfillmentCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<Fulfillment>("createFulfillments", args[0], args[1]),
    ttl: 60,
  })
  async bulkCreate(
    createFulfillmentDtosInput: CreateFulfillmentDto[]
  ): Promise<FulfillmentsResponse<Fulfillment>> {
    try {
      const entities = await this.repository.bulkCreate(
        createFulfillmentDtosInput.map((entity) => Fulfillment.fromDto(entity))
      );

      // Respuesta si el fulfillment no existe
      if (!entities)
        throw new NotFoundException("Entidades Fulfillments no encontradas.");
      // Devolver fulfillment
      return {
        ok: true,
        message: "Fulfillments creados con éxito.",
        data: entities,
        count: entities.length,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(FulfillmentCommandService.name)
      .get(FulfillmentCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateFulfillmentDto>("updateFulfillment", args[0], args[1]),
    ttl: 60,
  })
  async update(
    id: string,
    partialEntity: UpdateFulfillmentDto
  ): Promise<FulfillmentResponse<Fulfillment>> {
    try {
      const currentEntity = await this.queryRepository.findById(id);
      const candidate = Object.assign(new Fulfillment(), currentEntity ?? {}, partialEntity);
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, candidate, currentEntity, false);
      const entity = await this.repository.update(
        id,
        candidate
      );
      await this.applyDslServiceRules("update", partialEntity as Record<string, any>, entity, currentEntity, true);
      // Respuesta si el fulfillment no existe
      if (!entity)
        throw new NotFoundException("Entidades Fulfillments no encontradas.");
      // Devolver fulfillment
      return {
        ok: true,
        message: "Fulfillment actualizada con éxito.",
        data: entity,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }


  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(FulfillmentCommandService.name)
      .get(FulfillmentCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<UpdateFulfillmentDto>("updateFulfillments", args[0]),
    ttl: 60,
  })
  async bulkUpdate(
    partialEntity: UpdateFulfillmentDto[]
  ): Promise<FulfillmentsResponse<Fulfillment>> {
    try {
      const entities = await this.repository.bulkUpdate(
        partialEntity.map((entity) => Fulfillment.fromDto(entity))
      );
      // Respuesta si el fulfillment no existe
      if (!entities)
        throw new NotFoundException("Entidades Fulfillments no encontradas.");
      // Devolver fulfillment
      return {
        ok: true,
        message: "Fulfillments actualizadas con éxito.",
        data: entities,
        count: entities.length,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }

   @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(FulfillmentCommandService.name)
      .get(FulfillmentCommandService.name),
  })
  @Cacheable({
    key: (args) =>
      generateCacheKey<DeleteFulfillmentDto>("deleteFulfillment", args[0], args[1]),
    ttl: 60,
  })
  async delete(id: string): Promise<FulfillmentResponse<Fulfillment>> {
    try {
      const entity = await this.queryRepository.findById(id);
      // Respuesta si el fulfillment no existe
      if (!entity)
        throw new NotFoundException("Instancias de Fulfillment no encontradas.");

      await this.applyDslServiceRules("delete", { id }, entity, entity, false);

      const result = await this.repository.delete(id);
      await this.applyDslServiceRules("delete", { id }, entity, entity, true);
      // Devolver fulfillment
      return {
        ok: true,
        message: "Instancia de Fulfillment eliminada con éxito.",
        data: entity,
      };
    } catch (error) {
      // Imprimir error
      logger.error(error);
      // Lanzar error
      return Helper.throwCachedError(error);
    }
  }

  @LogExecutionTime({
    layer: "service",
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(FulfillmentCommandService.name)
      .get(FulfillmentCommandService.name),
  })
  @Cacheable({
    key: (args) => generateCacheKey<string[]>("deleteFulfillments", args[0]),
    ttl: 60,
  })
  async bulkDelete(ids: string[]): Promise<DeleteResult> {
    return await this.repository.bulkDelete(ids);
  }
}


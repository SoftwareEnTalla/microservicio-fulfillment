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


import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";

//Definición de entidades
import { Fulfillment } from "../entities/fulfillment.entity";

//Definición de comandos
import {
  CreateFulfillmentCommand,
  UpdateFulfillmentCommand,
  DeleteFulfillmentCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { FulfillmentQueryService } from "../services/fulfillmentquery.service";


import { FulfillmentResponse, FulfillmentsResponse } from "../types/fulfillment.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateFulfillmentDto, 
CreateOrUpdateFulfillmentDto, 
FulfillmentValueInput, 
FulfillmentDto, 
CreateFulfillmentDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => Fulfillment)
export class FulfillmentResolver {

   //Constructor del resolver de Fulfillment
  constructor(
    private readonly service: FulfillmentQueryService,
    private readonly commandBus: CommandBus
  ) {}

  @LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  // Mutaciones
  @Mutation(() => FulfillmentResponse<Fulfillment>)
  async createFulfillment(
    @Args("input", { type: () => CreateFulfillmentDto }) input: CreateFulfillmentDto
  ): Promise<FulfillmentResponse<Fulfillment>> {
    return this.commandBus.execute(new CreateFulfillmentCommand(input));
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  @Mutation(() => FulfillmentResponse<Fulfillment>)
  async updateFulfillment(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateFulfillmentDto
  ): Promise<FulfillmentResponse<Fulfillment>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateFulfillmentCommand(payLoad, {
        instance: payLoad,
        metadata: {
          initiatedBy: payLoad.createdBy || 'system',
          correlationId: payLoad.id,
        },
      })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  @Mutation(() => FulfillmentResponse<Fulfillment>)
  async createOrUpdateFulfillment(
    @Args("data", { type: () => CreateOrUpdateFulfillmentDto })
    data: CreateOrUpdateFulfillmentDto
  ): Promise<FulfillmentResponse<Fulfillment>> {
    if (data.id) {
      const existingFulfillment = await this.service.findById(data.id);
      if (existingFulfillment) {
        return this.commandBus.execute(
          new UpdateFulfillmentCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateFulfillmentDto | UpdateFulfillmentDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateFulfillmentCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateFulfillmentDto | UpdateFulfillmentDto).createdBy ||
            'system',
          correlationId: data.id || uuidv4(),
        },
      })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteFulfillment(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteFulfillmentCommand(id));
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  // Queries
  @Query(() => FulfillmentsResponse<Fulfillment>)
  async fulfillments(
    options?: FindManyOptions<Fulfillment>,
    paginationArgs?: PaginationArgs
  ): Promise<FulfillmentsResponse<Fulfillment>> {
    return this.service.findAll(options, paginationArgs);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  @Query(() => FulfillmentsResponse<Fulfillment>)
  async fulfillment(
    @Args("id", { type: () => String }) id: string
  ): Promise<FulfillmentResponse<Fulfillment>> {
    return this.service.findById(id);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  @Query(() => FulfillmentsResponse<Fulfillment>)
  async fulfillmentsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => FulfillmentValueInput }) value: FulfillmentValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<FulfillmentsResponse<Fulfillment>> {
    return this.service.findByField(
      field,
      value,
      fromObject.call(PaginationArgs, { page: page, limit: limit })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  @Query(() => FulfillmentsResponse<Fulfillment>)
  async fulfillmentsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<FulfillmentsResponse<Fulfillment>> {
    const paginationArgs = fromObject.call(PaginationArgs, {
      page: page,
      limit: limit,
    });
    return this.service.findWithPagination({}, paginationArgs);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  @Query(() => Number)
  async totalFulfillments(): Promise<number> {
    return this.service.count();
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  @Query(() => FulfillmentsResponse<Fulfillment>)
  async searchFulfillments(
    @Args("where", { type: () => FulfillmentDto, nullable: false })
    where: Record<string, any>
  ): Promise<FulfillmentsResponse<Fulfillment>> {
    const fulfillments = await this.service.findAndCount(where);
    return fulfillments;
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  @Query(() => FulfillmentResponse<Fulfillment>, { nullable: true })
  async findOneFulfillment(
    @Args("where", { type: () => FulfillmentDto, nullable: false })
    where: Record<string, any>
  ): Promise<FulfillmentResponse<Fulfillment>> {
    return this.service.findOne(where);
  }


@LogExecutionTime({
    layer: 'resolver',
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
      .registerClient(FulfillmentResolver.name)

      .get(FulfillmentResolver.name),
    })
  @Query(() => FulfillmentResponse<Fulfillment>)
  async findOneFulfillmentOrFail(
    @Args("where", { type: () => FulfillmentDto, nullable: false })
    where: Record<string, any>
  ): Promise<FulfillmentResponse<Fulfillment> | Error> {
    return this.service.findOneOrFail(where);
  }
}


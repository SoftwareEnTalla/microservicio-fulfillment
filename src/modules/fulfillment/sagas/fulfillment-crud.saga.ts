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


import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import {
  FulfillmentCreatedEvent,
  FulfillmentUpdatedEvent,
  FulfillmentDeletedEvent,
  FulfillmentStartedEvent,
  PickTaskCreatedEvent,
  PackCompletedEvent,
  DispatchReadyEvent,
} from '../events/exporting.event';
import {
  SagaFulfillmentFailedEvent
} from '../events/fulfillment-failed.event';
import {
  CreateFulfillmentCommand,
  UpdateFulfillmentCommand,
  DeleteFulfillmentCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class FulfillmentCrudSaga {
  private readonly logger = new Logger(FulfillmentCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onFulfillmentCreated = ($events: Observable<FulfillmentCreatedEvent>) => {
    return $events.pipe(
      ofType(FulfillmentCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de Fulfillment: ${event.aggregateId}`);
        void this.handleFulfillmentCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onFulfillmentUpdated = ($events: Observable<FulfillmentUpdatedEvent>) => {
    return $events.pipe(
      ofType(FulfillmentUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de Fulfillment: ${event.aggregateId}`);
        void this.handleFulfillmentUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onFulfillmentDeleted = ($events: Observable<FulfillmentDeletedEvent>) => {
    return $events.pipe(
      ofType(FulfillmentDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de Fulfillment: ${event.aggregateId}`);
        void this.handleFulfillmentDeleted(event);
      }),
      map(() => null)
    );
  };

  @Saga()
  onFulfillmentStarted = ($events: Observable<FulfillmentStartedEvent>) => {
    return $events.pipe(
      ofType(FulfillmentStartedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio FulfillmentStarted: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onPickTaskCreated = ($events: Observable<PickTaskCreatedEvent>) => {
    return $events.pipe(
      ofType(PickTaskCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio PickTaskCreated: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onPackCompleted = ($events: Observable<PackCompletedEvent>) => {
    return $events.pipe(
      ofType(PackCompletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio PackCompleted: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @Saga()
  onDispatchReady = ($events: Observable<DispatchReadyEvent>) => {
    return $events.pipe(
      ofType(DispatchReadyEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio DispatchReady: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(FulfillmentCrudSaga.name)
      .get(FulfillmentCrudSaga.name),
  })
  private async handleFulfillmentCreated(event: FulfillmentCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Fulfillment Created completada: ${event.aggregateId}`);
      // Lógica post-creación (ej: enviar notificación, ejecutar comandos adicionales)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(FulfillmentCrudSaga.name)
      .get(FulfillmentCrudSaga.name),
  })
  private async handleFulfillmentUpdated(event: FulfillmentUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Fulfillment Updated completada: ${event.aggregateId}`);
      // Lógica post-actualización (ej: actualizar caché)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(FulfillmentCrudSaga.name)
      .get(FulfillmentCrudSaga.name),
  })
  private async handleFulfillmentDeleted(event: FulfillmentDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Fulfillment Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaFulfillmentFailedEvent( error,event));
  }
}

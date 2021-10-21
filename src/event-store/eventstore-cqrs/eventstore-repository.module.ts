import { Global, Module, DynamicModule } from '@nestjs/common';
import { EventStoreBusConfig } from './event-bus.provider';
import { EventStore } from '../event-store.class';
import { EventStoreRepository } from './event-store.repository';
import { EventStoreModule, EventStoreModuleAsyncOptions } from '../event-store.module';

@Global()
@Module({})
export class EventStoreUtils {
  constructor() {}

  static forRootAsync(
    options: EventStoreModuleAsyncOptions,
    eventStoreBusConfig: EventStoreBusConfig): DynamicModule {
    return {
      module: EventStoreUtils,
      imports: [EventStoreModule.forRootAsync(options)],
      providers: [
        {
          provide: EventStoreRepository,
          useFactory: (eventStore) => {
            return new EventStoreRepository(eventStore, eventStoreBusConfig);
          },
          inject: [EventStore],
        },
      ],
      exports: [EventStoreRepository],
    };
  }
}

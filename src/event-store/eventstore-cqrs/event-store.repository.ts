import { Injectable } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';
import { ResolvedEvent, StreamEventsSlice } from 'node-eventstore-client';
import { ESAggregateRoot } from './../shared/eventstore-aggregate-root';
import { EventStore } from './../event-store.class';
import { EventStoreBusConfig } from './event-bus.provider';

@Injectable()
export class EventStoreRepository<T extends ESAggregateRoot> {
  constructor(
    readonly eventStore: EventStore,
    readonly config: EventStoreBusConfig,
  ) {}
  
  async findOneById (aggregate: T){
    let events = await this.getHistory(aggregate.streamId);
    aggregate.loadFromHistory(events);
    return aggregate;
  }

  async getHistory(streamName): Promise<IEvent[]> {
    const events: ResolvedEvent[] = [];
    let nextSliceStart;
    let currentSlice: StreamEventsSlice;

    do {
      currentSlice = await this.eventStore
        .getConnection()
        .readStreamEventsForward(
          streamName,
          nextSliceStart ? nextSliceStart : 0,
          200,
          true,
        );
      nextSliceStart = currentSlice.nextEventNumber;
      events.push(...currentSlice.events);
    } while (!currentSlice.isEndOfStream);
    const iEvents = events.map((x) => {
      const { event } = x;
      const data = Object.values(JSON.parse(event.data.toString()));
      return new this.config.events[event.eventType](...data);
    });
    return iEvents;
  }
}

import { AggregateRoot } from '@nestjs/cqrs'

export class ESAggregateRoot extends AggregateRoot{
  private version = -1
  public streamId: string
  
  constructor(streamName: string, id: string) {
    super();
    this.streamId = `${streamName}-${id}`
  }

  apply<T>(event: T, isFromHistory?: boolean){
    if (isFromHistory) {
      const handler = this.getEventHandler(event)
      handler && handler.call(this, event)
      ++this.version
      return
    }
    super.apply(event,isFromHistory)
  }

  protected getEventHandler<T>(
    event: T,
  ): Function | undefined {
    const handler = `on${this.getEventName(event)}`
    return this[handler]
  }

  protected getEventName(event: any): string {
    const { constructor } = Object.getPrototypeOf(event)
    return constructor.name as string
  }
}

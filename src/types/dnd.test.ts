import { describe, it, expectTypeOf } from 'vitest';
import type {
  DragItemData,
  DropValidationFn,
  SensorConfig,
  DragLifecycleCallbacks,
  DragPreviewMode,
  DropFeedbackMode,
  InvalidDropBehavior,
  CardDndProviderProps,
} from './dnd';
import type { CardData } from './card';

describe('DnD type definitions', () => {
  it('DragItemData has required card and type fields', () => {
    expectTypeOf<DragItemData>().toHaveProperty('card');
    expectTypeOf<DragItemData['card']>().toEqualTypeOf<CardData>();
    expectTypeOf<DragItemData>().toHaveProperty('type');
    expectTypeOf<DragItemData['type']>().toEqualTypeOf<'card'>();
  });

  it('DragItemData has optional sourceZoneId', () => {
    expectTypeOf<DragItemData>().toHaveProperty('sourceZoneId');
    expectTypeOf<DragItemData['sourceZoneId']>().toEqualTypeOf<
      string | undefined
    >();
  });

  it('SensorConfig fields are all optional', () => {
    // An empty object should satisfy SensorConfig
    expectTypeOf<{}>().toMatchTypeOf<SensorConfig>();

    expectTypeOf<SensorConfig>().toHaveProperty('mouseDistance');
    expectTypeOf<SensorConfig['mouseDistance']>().toEqualTypeOf<
      number | undefined
    >();

    expectTypeOf<SensorConfig>().toHaveProperty('touchDelay');
    expectTypeOf<SensorConfig['touchDelay']>().toEqualTypeOf<
      number | undefined
    >();

    expectTypeOf<SensorConfig>().toHaveProperty('touchTolerance');
    expectTypeOf<SensorConfig['touchTolerance']>().toEqualTypeOf<
      number | undefined
    >();
  });

  it('DropValidationFn accepts CardData and returns boolean', () => {
    expectTypeOf<DropValidationFn>().toBeFunction();
    expectTypeOf<DropValidationFn>().parameters.toEqualTypeOf<[CardData]>();
    expectTypeOf<DropValidationFn>().returns.toEqualTypeOf<boolean>();
  });

  it('DragLifecycleCallbacks has all optional callback fields', () => {
    expectTypeOf<{}>().toMatchTypeOf<DragLifecycleCallbacks>();
    expectTypeOf<DragLifecycleCallbacks>().toHaveProperty('onDragStart');
    expectTypeOf<DragLifecycleCallbacks>().toHaveProperty('onDragOver');
    expectTypeOf<DragLifecycleCallbacks>().toHaveProperty('onDrop');
    expectTypeOf<DragLifecycleCallbacks>().toHaveProperty('onDropReject');
    expectTypeOf<DragLifecycleCallbacks>().toHaveProperty('onDragCancel');
  });

  it('DragPreviewMode is a union of string literals', () => {
    expectTypeOf<'original'>().toMatchTypeOf<DragPreviewMode>();
    expectTypeOf<'translucent'>().toMatchTypeOf<DragPreviewMode>();
    expectTypeOf<'miniature'>().toMatchTypeOf<DragPreviewMode>();
  });

  it('DropFeedbackMode is a union of string literals', () => {
    expectTypeOf<'highlight'>().toMatchTypeOf<DropFeedbackMode>();
    expectTypeOf<'pulse'>().toMatchTypeOf<DropFeedbackMode>();
    expectTypeOf<'outline'>().toMatchTypeOf<DropFeedbackMode>();
  });

  it('InvalidDropBehavior is a union of string literals', () => {
    expectTypeOf<'snap-back'>().toMatchTypeOf<InvalidDropBehavior>();
    expectTypeOf<'reject-snap'>().toMatchTypeOf<InvalidDropBehavior>();
    expectTypeOf<'stay'>().toMatchTypeOf<InvalidDropBehavior>();
  });

  it('CardDndProviderProps extends DragLifecycleCallbacks', () => {
    expectTypeOf<CardDndProviderProps>().toHaveProperty('children');
    expectTypeOf<CardDndProviderProps>().toHaveProperty('onDragStart');
    expectTypeOf<CardDndProviderProps>().toHaveProperty('onDrop');
    expectTypeOf<CardDndProviderProps>().toHaveProperty('sensorConfig');
    expectTypeOf<CardDndProviderProps>().toHaveProperty('hapticFeedback');
  });
});

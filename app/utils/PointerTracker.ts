// TODO: delete this?

const ButtonsNone = 0;
const ButtonLeftMouseOrTouchOrPenDown = 1;
const noop = () => {};

type StartCallback = (pointer: PointerEvent) => boolean;
type MoveCallback = (
  previousPointers: PointerEvent[],
  changedPointers: PointerEvent[]
) => void;
type EndCallback = (pointer: PointerEvent, cancelled: boolean) => void;

interface PointerTrackerOptions {
  /**
   * Called when a pointer is pressed/touched within the element.
   *
   * @param pointer The new pointer. This pointer isn't included in this.currentPointers or
   * this.startPointers yet.
   *
   * @returns Whether you want to track this pointer as it moves.
   */
  start?: StartCallback;
  /**
   * Called when pointers have moved.
   *
   * @param previousPointers The state of the pointers before this event. This contains the same
   * number of pointers, in the same order, as this.currentPointers and this.startPointers.
   * @param changedPointers The pointers that have changed since the last move callback.
   */
  move?: MoveCallback;
  /**
   * Called when a pointer is released.
   *
   * @param pointer The final state of the pointer that ended. This pointer is now absent from
   * this.currentPointers and this.startPointers.
   * @param cancelled Was the action cancelled? Actions are cancelled when the OS takes over pointer
   * events, for actions such as scrolling.
   */
  end?: EndCallback;
}

/**
 * Track pointers across a particular element
 */
export default class PointerTracker {
  /**
   * State of the tracked pointers when they were pressed/touched.
   */
  readonly startPointers: PointerEvent[] = [];
  /**
   * Latest state of the tracked pointers. Contains the same number of pointers, and in the same
   * order as this.startPointers.
   */
  readonly currentPointers: PointerEvent[] = [];

  #startCallback: StartCallback;
  #moveCallback: MoveCallback;
  #endCallback: EndCallback;
  #element: HTMLElement;

  /**
   * Track pointers across a particular element
   *
   * @param element Element to monitor.
   * @param options
   */
  constructor(
    element: HTMLElement,
    { start = () => true, move = noop, end = noop }: PointerTrackerOptions = {}
  ) {
    this.#element = element;
    this.#startCallback = start;
    this.#moveCallback = move;
    this.#endCallback = end;

    // Add listeners
    this.#element.addEventListener('pointerdown', this.#pointerStart);
  }

  /**
   * Remove all listeners.
   */
  stop() {
    this.#element.removeEventListener('pointerdown', this.#pointerStart);
    this.#element.removeEventListener('pointermove', this.#move);
    this.#element.removeEventListener('pointerup', this.#pointerEnd);
    this.#element.removeEventListener('pointercancel', this.#pointerEnd);
  }

  /**
   * Call the start callback for this pointer, and track it if the user wants.
   *
   * @param pointer Pointer
   * @param event Related event
   * @returns Whether the pointer is being tracked.
   */
  #triggerPointerStart(pointer: PointerEvent): boolean {
    if (!this.#startCallback(pointer)) return false;
    this.currentPointers.push(pointer);
    this.startPointers.push(pointer);
    return true;
  }

  /**
   * Listener for mouse/pointer starts.
   *
   * @param event This will only be a MouseEvent if the browser doesn't support pointer events.
   */
  #pointerStart = (event: PointerEvent) => {
    if (!(event.buttons & ButtonLeftMouseOrTouchOrPenDown)) {
      return;
    }

    // If we're already tracking this pointer, ignore this event.
    // This happens with mouse events when multiple buttons are pressed.
    if (this.currentPointers.some((p) => p.pointerId === event.pointerId)) {
      return;
    }

    if (!this.#triggerPointerStart(event)) return;

    const capturingElement =
      event.target instanceof HTMLElement ? event.target : this.#element;
    capturingElement.setPointerCapture(event.pointerId);
    this.#element.addEventListener('pointermove', this.#move);
    this.#element.addEventListener('pointerup', this.#pointerEnd);
    this.#element.addEventListener('pointercancel', this.#pointerEnd);
  };

  /**
   * Listener for pointer/mouse/touch move events.
   */
  #move = (event: PointerEvent) => {
    if (event.buttons === ButtonsNone) {
      // This happens in a number of buggy cases where the browser failed to deliver a pointerup
      // or pointercancel. If we see the pointer moving without any buttons down, synthesize an end.
      // https://github.com/w3c/pointerevents/issues/407
      // https://github.com/w3c/pointerevents/issues/408
      this.#pointerEnd(event);
      return;
    }

    const previousPointers = this.currentPointers.slice();
    const changedPointers = [event];
    const trackedChangedPointers = [];

    for (const pointer of changedPointers) {
      const index = this.currentPointers.findIndex(
        (p) => p.pointerId === pointer.pointerId
      );
      if (index === -1) continue; // Not a pointer we're tracking
      trackedChangedPointers.push(pointer);
      this.currentPointers[index] = pointer;
    }

    if (trackedChangedPointers.length === 0) return;

    this.#moveCallback(previousPointers, trackedChangedPointers);
  };

  /**
   * Call the end callback for this pointer.
   *
   * @param event Pointer
   */
  #triggerPointerEnd = (event: PointerEvent): boolean => {
    // Main button still down?
    // With mouse events, you get a mouseup per mouse button, so the left button might still be down.
    if (event.buttons & ButtonLeftMouseOrTouchOrPenDown) {
      return false;
    }
    const index = this.currentPointers.findIndex(
      (p) => p.pointerId === event.pointerId
    );

    // Not a pointer we're interested in?
    if (index === -1) return false;

    this.currentPointers.splice(index, 1);
    this.startPointers.splice(index, 1);

    this.#endCallback(event, event.type === 'pointercancel');
    return true;
  };

  /**
   * Listener for mouse/pointer ends.
   *
   * @param event
   */
  #pointerEnd = (event: PointerEvent) => {
    if (!this.#triggerPointerEnd(event)) return;
    if (this.currentPointers.length) return;
    this.#element.removeEventListener('pointermove', this.#move);
    this.#element.removeEventListener('pointerup', this.#pointerEnd);
    this.#element.removeEventListener('pointercancel', this.#pointerEnd);
  };
}

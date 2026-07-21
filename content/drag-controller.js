const PRIMARY_POINTER_BUTTON = 0;
const VIEWPORT_MARGIN_PX = 0;
const POSITION_PROPERTIES = ["left", "top", "right", "bottom"];

function capturePositionStyles(element) {
  return Object.fromEntries(
    POSITION_PROPERTIES.map((property) => [
      property,
      {
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
      },
    ]),
  );
}

function restorePositionStyles(element, positionStyles) {
  for (const property of POSITION_PROPERTIES) {
    const { value, priority } = positionStyles[property];

    if (value) {
      element.style.setProperty(property, value, priority);
    } else {
      element.style.removeProperty(property);
    }
  }
}

export function createOllieDragController({
  character,
  positionElement,
  windowRef = window,
}) {
  const anchorPositionStyles = capturePositionStyles(positionElement);
  let activeDrag = null;
  let hasCustomPosition = false;

  character.addEventListener("pointerdown", handlePointerDown);
  windowRef.addEventListener("pointermove", handlePointerMove, true);
  windowRef.addEventListener("pointerup", handlePointerEnd, true);
  windowRef.addEventListener("pointercancel", handlePointerEnd, true);
  windowRef.addEventListener("resize", clampCurrentPosition);

  function handlePointerDown(event) {
    if (
      activeDrag ||
      event.button !== PRIMARY_POINTER_BUTTON ||
      event.isPrimary === false
    ) {
      return;
    }

    const characterRect = character.getBoundingClientRect();
    const positionRect = positionElement.getBoundingClientRect();
    activeDrag = {
      characterRect,
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      positionLeft: positionRect.left,
      positionTop: positionRect.top,
    };
    character.dataset.dragging = "true";
    character.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function handlePointerMove(event) {
    if (event.pointerId !== activeDrag?.pointerId) {
      return;
    }

    applyPointerPosition(event.clientX, event.clientY);
    event.preventDefault();
  }

  function handlePointerEnd(event) {
    if (event.pointerId !== activeDrag?.pointerId) {
      return;
    }

    if (event.type !== "pointercancel") {
      applyPointerPosition(event.clientX, event.clientY);
    }
    character.releasePointerCapture?.(event.pointerId);
    character.dataset.dragging = "false";
    activeDrag = null;
    hasCustomPosition = true;
    clampCurrentPosition();
    event.preventDefault();
  }

  function applyPointerPosition(pointerX, pointerY) {
    const deltaX = pointerX - activeDrag.pointerX;
    const deltaY = pointerY - activeDrag.pointerY;
    const desiredCharacterLeft = activeDrag.characterRect.left + deltaX;
    const desiredCharacterTop = activeDrag.characterRect.top + deltaY;
    const characterLeft = clamp(
      desiredCharacterLeft,
      VIEWPORT_MARGIN_PX,
      Math.max(
        VIEWPORT_MARGIN_PX,
        windowRef.innerWidth -
          activeDrag.characterRect.width -
          VIEWPORT_MARGIN_PX,
      ),
    );
    const characterTop = clamp(
      desiredCharacterTop,
      VIEWPORT_MARGIN_PX,
      Math.max(
        VIEWPORT_MARGIN_PX,
        windowRef.innerHeight -
          activeDrag.characterRect.height -
          VIEWPORT_MARGIN_PX,
      ),
    );

    setPosition(
      activeDrag.positionLeft +
        characterLeft -
        activeDrag.characterRect.left,
      activeDrag.positionTop + characterTop - activeDrag.characterRect.top,
    );
  }

  function clampCurrentPosition() {
    if (!hasCustomPosition || activeDrag) {
      return;
    }

    const characterRect = character.getBoundingClientRect();
    const positionRect = positionElement.getBoundingClientRect();
    const correctionX = getViewportCorrection(
      characterRect.left,
      characterRect.right,
      windowRef.innerWidth,
    );
    const correctionY = getViewportCorrection(
      characterRect.top,
      characterRect.bottom,
      windowRef.innerHeight,
    );
    if (correctionX || correctionY) {
      setPosition(
        positionRect.left + correctionX,
        positionRect.top + correctionY,
      );
    }
  }

  function setPosition(left, top) {
    positionElement.style.setProperty(
      "left",
      `${Math.round(left)}px`,
      "important",
    );
    positionElement.style.setProperty(
      "top",
      `${Math.round(top)}px`,
      "important",
    );
    positionElement.style.setProperty("right", "auto", "important");
    positionElement.style.setProperty("bottom", "auto", "important");
  }

  function resetToAnchor() {
    if (activeDrag && character.hasPointerCapture?.(activeDrag.pointerId)) {
      character.releasePointerCapture(activeDrag.pointerId);
    }

    activeDrag = null;
    hasCustomPosition = false;
    character.dataset.dragging = "false";
    restorePositionStyles(positionElement, anchorPositionStyles);
  }

  function dispose() {
    character.removeEventListener("pointerdown", handlePointerDown);
    windowRef.removeEventListener("pointermove", handlePointerMove, true);
    windowRef.removeEventListener("pointerup", handlePointerEnd, true);
    windowRef.removeEventListener("pointercancel", handlePointerEnd, true);
    windowRef.removeEventListener("resize", clampCurrentPosition);
  }

  return Object.freeze({
    clampCurrentPosition,
    resetToAnchor,
    dispose,
  });
}

function getViewportCorrection(start, end, viewportExtent) {
  if (start < VIEWPORT_MARGIN_PX) {
    return VIEWPORT_MARGIN_PX - start;
  }
  if (end > viewportExtent - VIEWPORT_MARGIN_PX) {
    return viewportExtent - VIEWPORT_MARGIN_PX - end;
  }
  return 0;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

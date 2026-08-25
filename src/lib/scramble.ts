import { gsap } from "gsap";

/**
 * Motor de scramble ("decodificación") para texto revelado por scroll.
 *
 * Por qué existe: la versión anterior usaba `setInterval` con el handle
 * guardado en una variable de closure. Cuando la animación se inicializaba dos
 * veces (Astro dispara `astro:page-load` también en la carga inicial), el
 * handle de la primera pasada quedaba inalcanzable desde la segunda y era
 * imposible cancelarlo: dos intervalos escribían sobre el mismo nodo a la vez.
 * Como el alfabeto además contenía dígitos, el resultado eran precios falsos
 * pero verosímiles ("USD $07$" en lugar de "USD $300"), y `onLeaveBack` los
 * dejaba congelados de forma permanente.
 *
 * Acá el handle vive en un WeakMap indexado por elemento, así que cualquier
 * pasada posterior puede cancelar la anterior, y TODO camino de salida del
 * tween (complete, interrupt, kill) escribe el valor real. Es imposible por
 * construcción quedarse con un valor falso en pantalla.
 */

/** Sin dígitos ni homoglifos: nunca puede leerse como un número real. */
const NOISE = "#+=<>";

const handles = new WeakMap<HTMLElement, gsap.core.Tween>();

const noise = () => NOISE[Math.floor(Math.random() * NOISE.length)];

export type IsStatic = (char: string) => boolean;

export const scrambleString = (final: string, isStatic: IsStatic) =>
  final
    .split("")
    .map((c) => (isStatic(c) ? c : noise()))
    .join("");

/**
 * Deja el elemento en estado "ruido", listo para reproducirse.
 * Solo debe llamarse con el elemento FUERA de la pantalla.
 */
export function armScramble(
  el: HTMLElement,
  final: string,
  isStatic: IsStatic,
): void {
  handles.get(el)?.kill(); // onInterrupt escribe el valor real…
  handles.delete(el);
  el.textContent = scrambleString(final, isStatic); // …y recién después, ruido
}

/** Corta cualquier animación en curso y deja el valor real. */
export function freezeScramble(el: HTMLElement, final: string): void {
  handles.get(el)?.kill();
  handles.delete(el);
  el.textContent = final;
}

/**
 * Reproduce la decodificación. El reveal se reparte solo sobre los caracteres
 * que efectivamente cambian, así que el valor correcto es legible durante una
 * fracción mucho mayor de la animación que en la versión anterior.
 */
export function playScramble(
  el: HTMLElement,
  final: string,
  isStatic: IsStatic,
  duration = 0.66,
): gsap.core.Tween {
  handles.get(el)?.kill();

  // Índices de los caracteres que realmente se animan (se excluye "USD $", que
  // antes consumía 5 de los 28 frames y retrasaba la resolución de los dígitos).
  const dynamic = final
    .split("")
    .map((c, i) => (isStatic(c) ? -1 : i))
    .filter((i) => i >= 0);
  const total = dynamic.length || 1;
  const proxy = { p: 0 };

  const tween = gsap.to(proxy, {
    p: 1,
    duration,
    ease: "none",
    onUpdate: () => {
      // Normalizado por cantidad de caracteres dinámicos: "USD $300" y
      // "USD $80" resuelven de forma sincronizada pese a tener distinto largo.
      const solved = Math.floor(proxy.p * total);
      el.textContent = final
        .split("")
        .map((c, i) =>
          isStatic(c) ? c : dynamic.indexOf(i) < solved ? c : noise(),
        )
        .join("");
    },
    onComplete: () => {
      el.textContent = final;
      handles.delete(el);
    },
    onInterrupt: () => {
      el.textContent = final;
      handles.delete(el);
    },
  });

  handles.set(el, tween);
  return tween;
}

/** ¿El usuario pidió movimiento reducido? */
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

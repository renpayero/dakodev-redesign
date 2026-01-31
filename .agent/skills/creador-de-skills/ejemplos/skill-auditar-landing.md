---
name: auditar-landing
description: Audita landing pages con checklist de UX, SEO y conversión. Usar cuando se necesite revisar una página antes de publicar o mejorar su rendimiento.
---

# Auditar Landing Page

Skill para revisar landing pages de forma sistemática usando criterios de UX, SEO y conversión.

## Cuándo usar este skill

- Cuando el usuario pida revisar una landing page
- Cuando se vaya a publicar una página nueva
- Cuando una landing no esté convirtiendo bien
- Cuando se necesite un checklist de calidad

## Inputs necesarios

- **URL o código de la landing**: Para analizar (obligatorio)
- **Objetivo de conversión**: Qué acción se espera del usuario (obligatorio)
- **Público objetivo**: A quién está dirigida (opcional)

## Workflow

1. Revisar estructura visual (hero, secciones, CTA)
2. Evaluar copy y propuesta de valor
3. Verificar elementos técnicos (SEO, velocidad, mobile)
4. Analizar flujo de conversión
5. Generar reporte con puntuación y recomendaciones

## Instrucciones

### Criterios de evaluación

| Área       | Peso | Elementos a revisar                       |
| ---------- | ---- | ----------------------------------------- |
| UX         | 30%  | Navegación, legibilidad, jerarquía visual |
| SEO        | 25%  | Meta tags, headings, alt texts, velocidad |
| Copy       | 25%  | Claridad, beneficios, urgencia, CTA       |
| Conversión | 20%  | Formularios, CTAs, trust signals          |

### Escala de puntuación

- **90-100**: Excelente, lista para publicar
- **70-89**: Buena, mejoras menores
- **50-69**: Regular, requiere ajustes
- **< 50**: Deficiente, rediseñar

## Output (formato exacto)

```markdown
## Auditoría de Landing: [nombre/URL]

### Puntuación general: X/100

### Resumen ejecutivo

[2-3 líneas con hallazgos principales]

### Desglose por área

| Área       | Puntuación | Estado   |
| ---------- | ---------- | -------- |
| UX         | X/30       | ✅/⚠️/❌ |
| SEO        | X/25       | ✅/⚠️/❌ |
| Copy       | X/25       | ✅/⚠️/❌ |
| Conversión | X/20       | ✅/⚠️/❌ |

### Top 3 mejoras prioritarias

1. [Mejora 1]
2. [Mejora 2]
3. [Mejora 3]

### Checklist detallado

[Lista de items revisados con ✅/❌]
```

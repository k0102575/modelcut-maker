# Modelcut Maker Design System

## Overview

Modelcut Maker is a private internal web tool for two non-technical operators.
The product must feel calm, trustworthy, and efficient.
The UI should help users move through one clear flow:

`로그인 -> 상품 사진 업로드 -> 생성 -> 결과 확인 -> 다운로드 -> 최근 작업 확인`

This system is inspired by CorpScale's enterprise tone, but adapted for a simpler Korean internal tool.

## Product Tone

- Professional, quiet, and operational
- More like an internal production console than a marketing site
- Light background with restrained navy emphasis
- Clear visual hierarchy for image work and status checking
- Korean-first copy with short and friendly guidance

## Design Principles

1. Prioritize workflow clarity over decoration
2. Keep most actions visible on one screen
3. Use compact but breathable spacing
4. Favor borders and contrast over flashy visual effects
5. Reserve strong color for primary actions, status, and navigation state

## Color Palette

- `Primary`: `#1E3A5F`
  Use for active navigation, page anchors, main button background, and key headings
- `Primary Hover`: `#172F4E`
  Use for pressed and hover states on primary controls
- `Accent`: `#2563EB`
  Use for links, info emphasis, and selected helper states
- `Background`: `#F8FAFC`
  App canvas and page background
- `Surface`: `#FFFFFF`
  Cards, panels, image containers, and modal-like sections
- `Surface Muted`: `#EEF2F6`
  Upload placeholders, secondary panels, neutral areas
- `Border`: `#D7DFE8`
  Inputs, card edges, separators, and table-like divisions
- `Text Primary`: `#142235`
  Main text and important labels
- `Text Secondary`: `#6B7280`
  Descriptions, metadata, timestamps, helper copy
- `Success`: `#16A34A`
  Completed jobs and positive messages
- `Warning`: `#CA8A04`
  Processing or pending states
- `Error`: `#DC2626`
  Failed states and validation messages

## Typography

- `Display / Page Title`: `Noto Serif KR`, 28px-34px, bold
- `Section Title`: `Noto Serif KR`, 22px-26px, semibold or bold
- `Subhead`: `Noto Serif KR`, 18px-20px, semibold
- `Body`: `Pretendard Variable`, 14px-16px, regular
- `Caption`: `Pretendard Variable`, 12px-13px, medium
- `Overline`: `Pretendard Variable`, 11px-12px, semibold, uppercase only when useful

Use serif only for page titles, section titles, and formal emphasis.
Use sans-serif for all form fields, buttons, metadata, and supporting copy.

## Radius And Depth

- Large panels: `8px`
- Inputs and buttons: `6px`
- Tags and small chips: `999px` only when a pill meaning is helpful
- Shadows should be light and secondary to borders
- Avoid oversized rounded cards

## Layout

- Desktop-first internal tool layout
- Fixed top bar plus left navigation
- Content sits inside structured panels, not free-floating blocks
- Workspace should feel like a production desk:
  upload area, settings, prompt, current result, recent work
- Dense screens are acceptable if the grouping is clear

## Components

### Navigation

- Active item uses navy background and white text
- Inactive items stay plain with subtle hover background
- Navigation labels should be direct and operational

### Buttons

- One strong primary action per area
- Secondary buttons use white surface with visible border
- Avoid decorative gradients and oversized shadows

### Cards

- White surface with thin border
- Tight but readable padding
- Titles should read like internal work sections, not marketing blurbs

### Inputs

- Neutral background or white background
- Clear 1px border
- Focus ring uses blue accent, not glow-heavy effects
- Error state must be obvious and readable in Korean

### Status

- `pending` / `processing`: amber family
- `completed`: green family
- `failed` / `expired`: red family
- Status chips should be compact and easy to scan

## Image Workflow Rules

- Product image upload is the visual priority on the workspace
- Model image is always secondary and optional
- Current result should be visible without leaving the main flow
- Recent work cards should emphasize thumbnail, status, and created time

## Copy Style

Write in simple Korean.

Good examples:

- `상품 사진을 올려주세요`
- `사람 사진은 선택입니다`
- `이미지를 만드는 중입니다`
- `결과를 확인하고 내려받아 주세요`
- `최근 작업은 3일 동안만 표시됩니다`

Avoid:

- Technical jargon
- Long explanatory paragraphs
- English-first labels unless unavoidable

## Do

- Use navy and gray as the main UI foundation
- Use serif headings to create a formal internal-tool tone
- Keep page titles and section titles explicit
- Make result actions visible without extra exploration
- Preserve a compact, efficient dashboard rhythm

## Don't

- Use playful colors or gradient-heavy hero styling
- Use corner radii larger than 8px on core panels
- Add decorative empty space that weakens workflow speed
- Hide key actions behind menus
- Turn this tool into a consumer SaaS aesthetic

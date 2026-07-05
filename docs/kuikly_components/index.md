# WG Basic Components — Index

This directory documents the WG basic component library — the in-house component set built on top of KuiklyUI. Each `.md` file is the API reference for one component (attributes, events, demo page, usage examples).

For framework-level concepts (Pager, ViewBuilder, attr/event DSL, FlexBox, observables, network requests), see `../basic_reference.md`.

The "Demo Page" column refers to the Kuikly `@Page` name you can launch from the demo app to see the component live.

## Foundation

Low-level primitives used everywhere — buttons, images, color/typography tokens, spacing, badges.

| Component | Demo Page | Description |
|-----------|-----------|-------------|
| [WGButton](./WGButton.md) | `KuiklyButtonDemo` | Brand-styled button with the company design-system visual presets. |
| [WGImage](./WGImage.md) | — | Recommended Image component replacing Kuikly's native `Image` (tap-state, fade-in, retry). |
| [WGSwitch](./WGSwitch.md) | `KuiklySwitchPage` | iOS-style toggle switch (green on / grey off, 44×24 by default). |
| [WGColor](./WGColor.md) | — | Unified color palette providing the full design-system color set. |
| [WGFont](./WGFont.md) | — | Unified typography system returning `TextStyle` objects (size, weight, line-height). |
| [Icon](./Icon.md) | — | Renders an Iconfont glyph by name with configurable size and color. |
| [Tag](./Tag.md) | `KTagPage` | Label chip defaulting to grey, turning green when selected. |
| [Badge](./Badge.md) | — | Red-dot / numeric / bubble badge overlay for unread or new-feature hints. |
| [Link](./Link.md) | `KuiklyLinkDemo` | Standalone and inline clickable link components with press-state styling. |
| [Loading](./Loading.md) | `KuiklyLoadingDemo` | Centered floating overlay for loading, success, failure, and warning states. |
| [Spacer](./Spacer.md) | — | Generic spacing component for inserting fixed gaps in layouts. |

## Input

Form fields, selection controls, and value-entry components.

| Component | Demo Page | Description |
|-----------|-----------|-------------|
| [InputSimple](./InputSimple.md) | — | Atomic thin wrapper around Kuikly's native single-line `Input` and multi-line `TextArea`. |
| [InputText](./InputText.md) | `KuiklyInputTextPage` | Text input with single/multi-line support and error state, built on `InputSimple`. |
| [InputNumber](./InputNumber.md) | `KuiklyInputNumberPage` | Numeric input (integers only) with max-value limit and optional unit label. |
| [Counter](./Counter.md) | `KuiklyCounterDemoPage` | Numeric stepper with minus/input/plus buttons, built on `InputSimple`. |
| [CheckBox](./CheckBox.md) | `KuiklyCheckBox`, `KuiklyRadioDemo` | Round checkbox and radio-button controls sharing one underlying implementation. |
| [Search](./Search.md) | `KuiklyNavBarSearchPage` | Search input with clear, image-pick, and scan buttons plus animated right-side state machine. |
| [Form](./Form.md) | `KuiklyFormDemoPage` | Form container rendering `FormCellConfig` rows with unified validation and value retrieval. |

## Navigation

Top bars, tabs, breadcrumbs, and side navigation.

| Component | Demo Page | Description |
|-----------|-----------|-------------|
| [NavBar](./NavBar.md) | `KuiklyNavBar3Page` | Top navigation bar carrying title, back/close button, and right action slots. |
| [NavBarActionButton](./NavBarActionButton.md) | `KuiklyNavBar2Page`, `KuiklyNavBar3Page` | Right-side NavBar action button supporting text, icon, icon+text, button, and image styles. |
| [ActionBar](./ActionBar.md) | `KuiklyActionBarDemo` | Operation toolbar for page-level primary actions. |
| [TabBar](./TabBar.md) | `KTabBarPage` | Tab bar linked to `PageList` for swipe-based page switching (standard or mini). |
| [SegmentControl](./SegmentControl.md) | `KSegmentControlPage` | Multi-segment tab switcher with animated slider indicator. |
| [Breadcrumb](./Breadcrumb.md) | `KuiklyBreadcrumbDemo` | Hierarchical path navigator with click-focus, auto-back, and horizontal scroll. |
| [SideBar](./SideBar.md) | `SideBarDemoPage` | Dual-pane layout with a scrollable left category bar synced to a right content list. |

## Feedback

Overlays, dialogs, sheets, popovers, toasts, and result pages — anything that surfaces information or asks for confirmation.

| Component | Demo Page | Description |
|-----------|-----------|-------------|
| [Dialog](./Dialog.md) | `KuiklyDialogDemo` | Centered modal dialog for confirmations, alerts, and informational prompts. |
| [DialogContainer](./DialogContainer.md) | — | Page-level container that manages and renders the full dialog/overlay stack. |
| [ModalFrame](./ModalFrame.md) | `KuiklyModalDemo` | Bottom modal sheet for presenting content in an overlay panel. |
| [ModalFrameX](./ModalFrameX.md) | `KuiklyModalDemo` | Draggable bottom modal — expands to full-screen on upward drag, closes on downward drag. |
| [ActionSheet](./ActionSheet.md) | `KActionSheetPage`, `KActionSheetSelectPage` | Bottom sheet listing actions or selectable options with a fixed cancel button. |
| [ActionArea](./ActionArea.md) | — | Bottom action zone for modal dialogs (confirm/cancel/link buttons or sheet-style cancel). |
| [PopOver](./PopOver.md) | `KPopOverPage` | Bubble popover anchored near a target element for hints or action menus. |
| [PopViewSelect](./PopViewSelect.md) | `KSelectPage` | Drop-down selector that pops relative to a target view. |
| [Toast](./Toast.md) | `KToastPage` | Brief transient message shown via `BaseVisuals.showGuideToast`. |
| [SnackBar](./SnackBar.md) | `KuiklySnackBarDemo` | Inline notification bar with icon, text, optional link, and optional close button. |
| [Push](./Push.md) | `KPushDemoPage` | Message-style notification bubble. |
| [Result](./Result.md) | `KuiklyResultDemo` | Result-page component for success, failure, and empty-search states. |
| [Stepper](./Stepper.md) | `StepperHorizontalDemoPage`, `StepperVerticalDemoPage` | Multi-step progress indicator (horizontal or vertical workflows). |

## Layout

Row/cell building blocks and list-rendering helpers.

| Component | Demo Page | Description |
|-----------|-----------|-------------|
| [Cell](./Cell.md) | `KuiklyCellDemo` | General-purpose list row component. |
| [Footer](./Footer.md) | `KuiklyFooterDemo` | List-bottom status indicator (loading, no-more, error). |
| [RenderList](./RenderList.md) | — | List renderer replacing Kuikly's `vfor`/`vforIndex`/`vforLazy` with a unified API. |

## Invocation patterns

Many feedback components are not placed inline in `body()` — they are launched imperatively through `BaseVisuals` helpers (e.g. `showSimpleSuccessToast`, `showTextDialog`, `showActionSheet`, `showModalFrame`, `createPopover`). Each component's individual doc shows the exact `BaseVisuals` entry point. See `BaseVisuals.kt` for the full list.

# adnbn

[![npm version](https://img.shields.io/npm/v/adnbn.svg)](https://www.npmjs.com/package/adnbn)
[![npm downloads](https://img.shields.io/npm/dm/adnbn.svg)](https://www.npmjs.com/package/adnbn)

## Addon Bone - Cross-Browser Web Extension Framework with shared code base

**Cross-browser framework** for developing extensions on a single code base. Enables creating multiple production-grade extensions with different localizations, icons, and designs while maintaining identical core functionality.

### Core Concept

* **Single code base**: maintain one set of source files for all extensions.
* **Flexibility**: supports both multi-package setups (multiple extensions in one repository) and standalone projects.
* **Modern workflow**: automatic merging of styles, scripts, content scripts, and background scripts.

### Supported Platforms & Manifests

* **Browsers**: Chrome, Firefox, Opera, Safari, Edge.
* **Manifest Versions**: Manifest V2 and V3.

### Entry Points

* **Background Page**
* **Content Scripts**
* **Commands**
* **Localization**
* **Icons**
* **Messages**
* **Services**
* **Relay**
* **Offscreen**
* **Popup**
* **Sidebar**

### Plugins

* **Extensibility via Plugins**: write modules for background pages, content scripts, and any supported entry points.
* **Automatic Integration**: plugins are automatically included in the build process and update the manifest.

### Services & Relay

* **Services**: class-based layer for background interactions without boilerplate. Service methods are available across all extension layers via simple calls.
* **Relay**: similar mechanism for content pages, bypassing CSP and getUserGesture restrictions by leveraging scripting contexts.


### Offscreen

* **Manifest V2**: offscreen support via `<iframe>` within the Background Page.
* **Manifest V3**: native Offscreen API.

### Benefits

* 🔌 **Plugin Architecture**: easily extend functionality and add features without modifying the core framework.
* 🔧 **Faster Development**: minimal configuration and boilerplate.
* 🌐 **Cross-Platform**: write code once; run everywhere regardless of browser or manifest version.
* 🔄 **Scalable**: seamlessly add new layers and entry points.
* 🚀 **Modern Design**: cutting-edge architecture following best practices for extension publishing.

---

> *This framework is under active development. Detailed documentation and usage examples will be available soon on the official website.*

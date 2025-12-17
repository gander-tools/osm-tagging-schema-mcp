# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.0](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v3.2.0...v3.3.0) (2025-12-17)


### Features

* add version and build timestamp to startup logs ([bc324f4](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/bc324f4560c39b5e45bf170abc878607a2062b93))

## [3.2.0](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v3.1.0...v3.2.0) (2025-12-17)


### Features

* **ci:** add reusable composite actions for GitHub workflows ([c70c526](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c70c52646cf63de85d3e752b2df1824bba491d97))


### Bug Fixes

* **ci:** resolve composite action checkout dependency issue ([cc22355](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/cc22355da00c21f6c9fdc1f07627c152624e867d))


### Documentation

* add comprehensive dependency management guide ([8715944](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/871594406a639444dcc05440ee84b0e1eff6876d))

## [3.1.0](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v3.0.1...v3.1.0) (2025-12-04)


### ⚠ BREAKING CHANGES

* Update minimum supported Node.js and npm versions

### Features

* Add comprehensive GitHub issue templates ([3bfc567](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/3bfc56728314e68348b349c5112876c796375ba1))
* Add comprehensive GitHub issue templates ([3967512](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/3967512b7d1f7d34660e488d932428f1906cbf5e))
* Add comprehensive GitHub issue templates ([#371](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/371)) ([6c74f13](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/6c74f137b9dfd0b3e22062b9cde3ca977915e988))
* Add comprehensive GitHub issue templates ([#375](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/375)) ([e92ae61](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/e92ae614d376be386d947bfb23e7457ad1c73c1a))
* use tilde (~) for dependency version ranges for stricter patch-level updates ([eccad18](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/eccad189f3a548603fe0304d0af03b658305509c))
* use tilde (~) for dependency version ranges for stricter patch-level updates ([15c8dcd](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/15c8dcdae7493df99fcf90cf57dcaa6160f6e74e))


### Bug Fixes

* **deps:** update dependency @modelcontextprotocol/sdk to ~1.24.0 [security] ([e9feab1](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/e9feab1e0eb75f66c73f0465f39b9f4246831afd))
* **deps:** update dependency @modelcontextprotocol/sdk to ~1.24.0 [security] ([#377](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/377)) ([5bd54d5](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/5bd54d51ffdb3267e483026dbfda4222124e0743))


### Documentation

* Replace hardcoded dependency versions with dynamic badges ([#380](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/380)) ([c004137](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c004137e5dee6287d2ff8ea2401e9d4cab2572fe))


### Miscellaneous Chores

* extend Node.js and npm version support for Claude Code for Web compatibility ([cda8fb8](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/cda8fb875be57fa48720665814636a847d3cc11d))

## [3.0.1](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v3.0.0...v3.0.1) (2025-12-01)


### Miscellaneous Chores

* force release 3.0.1 ([bdeda26](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/bdeda2658fc2f20b57ad4ac8d386c917fb878bf6))

## [3.0.0](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v2.3.1...v3.0.0) (2025-12-01)


### ⚠ BREAKING CHANGES

* Rename binary to 'osm-tagging-schema-mcp' ([#362](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/362))
* Rename binary from 'osm-tagging-mcp' to 'osm-tagging-schema-mcp'

### Code Refactoring

* Rename binary from 'osm-tagging-mcp' to 'osm-tagging-schema-mcp' ([4780384](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/478038405f9b5c821a1bded7fc7b1c8c2f3af64b))
* Rename binary to 'osm-tagging-schema-mcp' ([#362](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/362)) ([2622158](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/262215896b5300bad29cc7824d0d6d92725678f6))

## [2.3.1](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v2.3.0...v2.3.1) (2025-12-01)


### Bug Fixes

* replace manual JSON imports with ESM imports from id-tagging-schema ([04ee8a1](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/04ee8a19c9d3a071a6e44b86cb96fe0e61abc3a7))
* **types:** refine type assertions and improve safety in tests and tools ([3601cbe](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/3601cbeaf060938b9b618d9bb7ad0bc4e127e896))
* **types:** update `TranslationField.options` type to allow string values ([a74f7a0](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/a74f7a01e9c553b49c2456e0222289fbd5c2f80a))


### Code Refactoring

* simplify type imports and conditional checks in tools ([88eb94c](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/88eb94c4e885e695c2496ca595f342207d5730e3))

## [2.3.0](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v2.2.0...v2.3.0) (2025-11-29)


### Features

* add Claude Code settings with automatic hooks ([#346](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/346)) ([5207d80](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/5207d80933b59c372ba09bb57fb2590b30b27e02))
* **scripts:** add `check:unsafe` script for biome with `--unsafe` flag ([#348](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/348)) ([1882fd7](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/1882fd742c17f484da87cf00ba63b3440dd4a9e0))


### Bug Fixes

* **package.json:** update `lint` script to auto-fix issues with `--write` flag ([afb93b2](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/afb93b2dba98a3e462e79e917d3fef31988a5559))
* **package.json:** update `lint` script to auto-fix issues with `--write` flag ([#347](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/347)) ([1521ea7](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/1521ea7a3f21b63dd128a8e961aba94aa128cf2b))


### Documentation

* update README badges and current status ([000c332](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/000c33292959de314bb1d0c1c5e96902ad30cffb))
* update README badges and current status ([#351](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/351)) ([a407f12](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/a407f122fa626de04d9b04c7d3f8d59de0141bd2))

## [2.2.0](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v2.1.0...v2.2.0) (2025-11-29)


### Features

* add websiteUrl and title fields to McpServer configuration ([ab1703d](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/ab1703d40ffd940b504ae6325fa95b42903cd58f))
* add websiteUrl and title fields to McpServer configuration ([#344](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/344)) ([112cd31](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/112cd31e945f976f35f70421c5da7f0cb5d5dd8a))

## [2.1.0](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v2.0.2...v2.1.0) (2025-11-29)


### Features

* **prompts:** add comprehensive MCP prompts for OSM tagging workflows ([6969f91](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/6969f91778c545cfbb67974d9f0706871e3f8197))
* **server:** register MCP prompts and enable prompts capability ([d21f924](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d21f924c801ea831d6a95b3024d621fd177a6ef1))


### Bug Fixes

* **imports:** replace import assertions with createRequire for Node 22/24 compatibility ([a17a7cb](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/a17a7cbb72dade218554a74271f491ebb1a53939))
* **imports:** use readFileSync instead of createRequire for better Node.js compatibility ([11e38f6](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/11e38f616717b7ba42e2eae97a4a1d891ad2ccbe))
* **prompts:** resolve TypeScript type errors in prompt definitions ([44addc2](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/44addc23188dd8d3b19cecedd272d0d96898b7ba))
* **tests:** fix unit test exclusion pattern for proper test isolation ([d22538f](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d22538fa35d02e9e8cea76cc1aeb282168462bb4))
* **tests:** remove redundant string replacement in prompt test ([28a6a50](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/28a6a5063f642055985f878b41019bac1ffecb02))
* **tools:** add use case clarity to search_presets description ([e67b04d](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/e67b04d3c72c896fd418b4a8abd7e45fdc398ea8))
* **tools:** improve search_tags tool descriptions with detailed examples ([#342](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/342)) ([62d7eb7](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/62d7eb7a6e8a2e73650f653262560b3fe2e52d74))


### Documentation

* complete rewrite and verification of all tool documentation ([c3cdeda](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c3cdedafb2d8f6f8947bf6ca72758d9e06a359dc))
* complete rewrite and verification of all tool documentation ([#339](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/339)) ([82a8348](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/82a8348541f777fde3be7c16760c151075590f67))
* **tools:** enhance get_preset_details descriptions with expansion details ([ad860ea](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/ad860eaca857ae1519bea16a2e24925610d4dd8e))
* **tools:** enhance suggest_improvements descriptions with workflow details ([2e6db09](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/2e6db09432d882955a611228c1d33153d3696fb7))
* **tools:** enhance validate_tag tool descriptions with comprehensive details ([1689d58](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/1689d58c2e999cb2cb32b32c484574f7211050ac))
* **tools:** expand flat_to_json descriptions with parser capabilities ([5349438](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/5349438dd3ce632b58444f3f342ece088bcbaa70))
* **tools:** expand json_to_flat descriptions with validation details ([32e6b9c](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/32e6b9c2a2972c7a27993a688f592659e13be437))
* **tools:** expand search_presets descriptions with preset concept explanation ([96fb727](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/96fb7270e3a191a8c9305a3e060d428b556e4925))
* **tools:** expand validate_tag_collection descriptions with use cases ([59ab7ba](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/59ab7ba3508acb269537797a72bc5006f65ac76e))
* **tools:** improve get_tag_values descriptions with data source details ([4fd868b](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/4fd868b567ed3b994028a1fe9e13e024f817ed47))
* **tools:** improve search_tags tool descriptions with detailed examples ([55f7308](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/55f7308cb035f594f292f182f4c65d52cc7a339f))

## [2.0.2](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v2.0.1...v2.0.2) (2025-11-29)


### Documentation

* add comprehensive MCP Inspector testing guide ([28a2acc](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/28a2accf38ef448443e433fbaf9d2787f446c724))
* add comprehensive MCP Inspector testing guide ([#335](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/335)) ([1977ce8](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/1977ce8110c5c8054fd6d65b772774cc4de38ea2))
* add missing CORS_ORIGINS to .env.example ([d734cc3](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d734cc33a8b331c4167c0fd150ee853914a309ac))
* add missing CORS_ORIGINS to .env.example ([#337](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/337)) ([ceeaa60](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/ceeaa60092966c2c68fcffcf93ebed48fecbb247))
* reorganize running/deployment documentation for clarity ([2d6d7f2](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/2d6d7f2ff5d97714e6820ec0a7b667594627e1fa))

## [2.0.1](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v2.0.0...v2.0.1) (2025-11-29)


### Bug Fixes

* resolve npm bin symlink for correct module detection ([#332](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/332)) ([b710df8](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/b710df87e788d3743f339d82082dbe9e11aad7dc))


### Documentation

* replace static badges with dynamic auto-updating alternatives ([#329](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/329)) ([198dc94](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/198dc943a181cd08157c8a9dc73f880b40b6200e))
* update badges - replace publish-npm with release-please workflow and remove repo status badge ([35b334f](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/35b334fcdd3c591426fd24cdd6e8faf8060275d7))
* update badges - replace publish-npm with release-please workflow and remove repo status badge ([#327](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/327)) ([3458d37](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/3458d37ac0d24f9c73e7b752a0f39241c25ab1e1))


### Code Refactoring

* remove unused docker-compose files and update documentation ([#333](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/333)) ([d1e3884](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d1e3884ac9a00c974f16484f20accfdeb1b9d713))

## [2.0.0](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v1.1.1...v2.0.0) (2025-11-29)


### ⚠ BREAKING CHANGES

* **deps:** Update zod dependency from ^3.25.0 to ^4.0.0

### Features

* **ci:** optimize actionlint workflow with paths-filter ([85366d1](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/85366d14fe3a04c83e163bdc5f74cdec6fff050c))
* **ci:** optimize actionlint workflow with paths-filter ([#326](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/326)) ([c52b547](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c52b547435a27957dbae698788de520f695b82a3))


### Bug Fixes

* update ghcr-cleanup-action to valid commit SHA ([91d898b](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/91d898bc3304f07906e5ac277c8cf9f33107fa7b))
* update ghcr-cleanup-action to valid commit SHA ([#325](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/325)) ([cada818](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/cada818e3f10d26def7024210e22a620bf6468bf))


### Documentation

* add comprehensive workflow redundancy analysis ([6067801](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/6067801cb6ce5e125647143020d4b6748d38a169))


### Miscellaneous Chores

* **deps:** upgrade zod from v3 to v4 ([5b6c862](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/5b6c8620ee1ff7f6b7b3c7a0d2d2b6df5d7fc51b))

## [Unreleased]

### Changed

- **Workflow Simplification**: Removed redundant `publish-npm.yml` workflow (functionality covered by `release-please.yml`)
- **Docker Build Optimization**: Simplified `publish-docker.yml` by removing redundant tag triggers that caused duplicate builds
  - Removed `push: tags` trigger (redundant with `workflow_run` after Release Please)
  - Removed `validate-branch` job (dead code without tag triggers)
  - Docker builds now triggered exclusively by `workflow_run` after successful Release Please workflow
  - Reduced CI/CD time by ~50% per release (eliminated duplicate builds)

### Removed

- Manual NPM publishing workflow (`publish-npm.yml`) - redundant with Release Please automation

## [1.1.1](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v1.1.0...v1.1.1) (2025-11-28)


### Bug Fixes

* Enable 'latest' tag for Docker images in workflow_run triggers ([298a7ca](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/298a7cadb6fa175eb08f8548123beca39b1e9bca))
* Enable 'latest' tag for Docker images in workflow_run triggers ([#309](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/309)) ([bb50fca](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/bb50fca69cdebf67fd9c7f6809a4f4ee8ee0614b))

## [1.1.0](https://github.com/gander-tools/osm-tagging-schema-mcp/compare/v1.0.6...v1.1.0) (2025-11-28)


### ⚠ BREAKING CHANGES

* HTTP and SSE transport support has been removed. The server now only supports stdio transport, which is the standard for MCP clients (Claude Desktop, Claude Code, etc.).
* **http:** HTTP transport now requires browser origin for Inspector UI
* Removed the following tools:
    - get_categories
    - get_category_tags
    - get_preset_tags
    - get_related_tags
    - get_schema_stats
    - get_tag_info
* get_tag_info and get_tag_values now return structured objects with titles and descriptions instead of simple string arrays
* Changed response structure from single result to collection of cases

### Features

* add actionlint workflow for GitHub Actions validation ([#265](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/265)) ([a030cba](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/a030cba80bfc8fc0292635a156ad0dd63fe33170))
* Add comprehensive fuzzing infrastructure with fast-check ([18e8865](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/18e88651f756fa7492d29826f103769ca53df0b7))
* add Docker Compose deployment with health check endpoints ([a5fc202](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/a5fc202233e185359dc67fae509d821f7c0aa0d6))
* add Docker Compose deployment with health check endpoints ([c152b24](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c152b243b6ef3b009b419f35ee7afbe78fd4c4ac))
* Add flexible Docker image versioning for manual workflow triggers ([#290](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/290)) ([616e0a9](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/616e0a9b97c5274b7ed7c254280a65c7d661ca55))
* add hourly cleanup workflow for packages and workflow runs ([c88d3d1](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c88d3d1b27882cc07c57281842c1053fc82899d2))
* add input trimming to all remaining tools ([26431e7](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/26431e703dd3a1f4ef65911a1558357e66361c1f))
* add lefthook for automated code quality checks ([95c66e9](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/95c66e982209021e5e90c5a7cbebcff3f9ba0a5d))
* add lefthook for automated code quality checks ([42a5d24](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/42a5d2448ba2610a640603977fb594a06af59642))
* add manual release workflow with GitHub Actions ([7b90f79](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/7b90f7967e1a9c61007428a913ac4a494318bc66))
* add manual release workflow with GitHub Actions ([2e5cfcd](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/2e5cfcd657cbae0269df6351130f4e43e236767c))
* add on-demand Docker build workflow for Pull Requests ([#261](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/261)) ([3b5cd6e](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/3b5cd6e5ce1320959ad8b97e47a1a5b7e5717a54))
* add safe release workflow with manual approval ([#180](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/180)) ([6b779b4](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/6b779b4670b91ae76db14317c879be441f6480b4))
* add structured value information with localized titles and descriptions ([d9ca826](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d9ca8267c4b9384eff8a338363ab9fe8a9a5ec14))
* add structured value information with preset names ([07a7007](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/07a70077134d90417a1efb59a24628cd4f41313b))
* add text format support for validate_tag_collection and suggest_improvements ([9f2013a](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/9f2013ab6071032aaeae2516ac9243064da60f21))
* add ToolDefinition interface for MCP SDK migration ([f962e1e](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/f962e1e59e0f4c53142dbd62e09d9b230bbc55be))
* add value descriptions to get_tag_values tool ([938b0d1](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/938b0d1f579382808fd1c4ddbf825683c713450f))
* add value descriptions to get_tag_values tool ([6f5aab8](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/6f5aab82c525e75b4d97755187864f389af62088))
* Add webhook notification for Docker latest tag publication ([04cb319](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/04cb31909db6dc216b4b8a57822d49cf96f750ca))
* **ci:** extend paths-filter to security and dependency workflows ([#267](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/267)) ([61f5857](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/61f58574811741536eb6eff4d1d15a066efb939f))
* **ci:** implement dorny/paths-filter for optimized CI runs ([#264](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/264)) ([ac0683f](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/ac0683f8b26d1aafc2f27a5f233d2b7ede54c473))
* **ci:** implement dorny/paths-filter for optimized CI runs ([#266](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/266)) ([2d7e302](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/2d7e302cdd52e2fd36d6e0e94745018b75b70daa))
* **ci:** merge Docker workflows into unified publish-docker.yml ([1698f47](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/1698f47fce12c3748a821f6c775085e1a2f3de88))
* complete MCP SDK migration - all 14 tools migrated ([57dfaa6](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/57dfaa6a31ade12b0f45b58bc21bc68efac122d5))
* **http:** Add CORS support for MCP Inspector UI compatibility ([055ef81](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/055ef81cbd4cdc9d6d4c810f40b1c5b77fc33344))
* implement Server-Sent Events (SSE) transport ([a00d5fa](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/a00d5faa2be7aff8d3c04deaa7046c30a58d5b84))
* implement Server-Sent Events (SSE) transport ([239d8c8](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/239d8c83ffd2100bdda90c91398a6fe3d2241bd0))
* implement srvaroa/labeler for automatic PR/issue label management ([#263](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/263)) ([57d3f0b](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/57d3f0bf3d99ffc37157a61a51199c5b01c24d87))
* introduce automated tag creation and branch validation for secure CI/CD ([#220](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/220)) ([8c8e763](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/8c8e7638babb67301e6c4e5c6f964b6d503beabe))
* migrate get_categories to new MCP SDK tool registration ([b22a662](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/b22a66262b4e006b6297e0df69a98199f13c54f2))
* migrate get_category_tags to new MCP SDK tool registration ([9dcc8df](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/9dcc8dfd6f4a467afc59c19488427a64f3befb56))
* migrate get_related_tags and search_presets to new MCP SDK ([af27366](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/af27366a4f6eeb0a50270f6306ccaa792d925a8e))
* migrate get_schema_stats to new MCP SDK tool registration ([31c1c20](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/31c1c2038aa8fdef7a1f89fcf5206f754771f37a))
* migrate get_tag_info to new MCP SDK tool registration ([28a3286](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/28a3286ebeaf9dd7b9c608c7cb7173be2048c552))
* migrate get_tag_values to new MCP SDK tool registration ([753bfed](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/753bfed204c96b4f1b03dcd32c17ac169152b234))
* migrate search_tags to new MCP SDK tool registration ([75eec76](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/75eec76eb416fea7c421546c97e948e9d776ce54))
* **publish:** add .npmrc with provenance configuration ([165963f](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/165963f85bcb88a5344dc4df4edc6a80cc5aaced))
* **publish:** enhance workflow with SLSA attestations and SBOM ([58e42b2](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/58e42b2825c3d61d2c04bb32f16d7bb10a28bcb4))
* **release:** add cliff-jumper and git-cliff for automated releases ([d40b24e](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d40b24e260bba1a576ab2507ac89ca009dd082ed))
* **release:** add cliff-jumper and git-cliff for automated releases ([57f0c7b](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/57f0c7b50d3d20a201eada0eb706b718f055972a))
* Remove HTTP/SSE transport support - stdio only ([3ee450c](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/3ee450c0a442f8ec15ac36196a4ce37aa5380e00))
* Remove SSE transport support - HTTP only ([572a157](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/572a1577134d32dd890c59b7eb015f3391fe8399))
* Remove SSE transport support - HTTP only ([8c2eb2e](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/8c2eb2eb6833be13b81f56da98ab4a0e8f3831e7))
* Share build artifact between NPM and Docker workflows ([#183](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/183)) ([27c9e4c](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/27c9e4c0a0b9a1e66f6f51fbf67e3ce66de6caff))
* **transport:** Add SSE keep-alive ping messages for HTTP transport ([eb4559c](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/eb4559ca9ec5d116f6cb8e40be323f3866622040))
* update cleanup automation to Auto Cleanup with separate dev/tagged handling ([#115](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/115)) ([0a44dfa](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/0a44dfae43663a2e3fd2a825ce3867b9acf1000e))
* use pkg.version from package.json for application version ([18e5838](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/18e58382d7c27845527360742bd257d0c96390f8))
* use pkg.version from package.json for application version ([03722e0](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/03722e07c193e3cb7ad987c98aa438f026fc4745))


### Bug Fixes

* add biome-ignore comment for heterogeneous tools array ([89ba455](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/89ba455bce108fa075054bd38cbb5f15e504dc3f))
* add Cloudflare Access secrets to Docker publish workflow ([bff8777](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/bff8777abcff0c354697852d7d0e4d2dfeafd757))
* add Cloudflare Access secrets to Docker publish workflow ([33b1282](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/33b12827a480a44ce7795c25e20dd57ed86efca9))
* Add CodeQL workflow and pin dependencies for Scorecard compliance ([f3388f3](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/f3388f324f7cfd91cb98087eab1a4d63a259695f))
* add modern entry point fields for bundlephobia compatibility ([26ad493](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/26ad493bee63431ef5a3f2df627d9f041a72f994))
* change postinstall to prepare for lefthook ([1e84a89](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/1e84a896b7adbee3c005c01a7201b634f2dda9bc))
* change postinstall to prepare for lefthook ([573aa23](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/573aa23cf2b573379eaca88b2081483c48fe878e))
* **ci:** remove NODE_AUTH_TOKEN for npm Trusted Publishers ([#80](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/80)) ([c80fb57](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c80fb5764ff1d68acc56154bdf64baea6b3f08e6))
* **ci:** resolve SC2242 shellcheck error in actionlint workflow ([03c3b5d](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/03c3b5dd8fc91c493978447b4d7f717eecdca580))
* **ci:** resolve SC2242 shellcheck error in actionlint workflow ([f83fad0](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/f83fad0fb39211b2123f4c9c6772d28489695196))
* **ci:** resolve shellcheck issues in actionlint.yml workflow ([076fce6](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/076fce6dae0a26667970c1193c5b7d4baebfe414))
* **ci:** resolve shellcheck issues in actionlint.yml workflow ([#269](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/269)) ([c1d3106](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c1d3106f3a9df633ea015d63b91b65760060652d))
* **ci:** resolve shellcheck issues in auto-pr.yml workflow ([e40df61](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/e40df6105e26b05def2066d145b6310709b4acc2))
* **ci:** resolve shellcheck issues in auto-release-from-pr.yml workflow ([20b6c28](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/20b6c28fd12c82922529eb41c871a9ae610ade1d))
* **ci:** resolve shellcheck issues in docker-build-on-demand.yml workflow ([d98383d](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d98383d9273e020ca9c41fac54119f236f47272c))
* **ci:** resolve shellcheck issues in fuzz.yml workflow ([d2747ab](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d2747ab20fafb100931ea86a1acc3a1afce2fed2))
* **ci:** resolve shellcheck issues in publish-docker.yml workflow ([561271a](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/561271a2f0eb78c6d8ef761d6d45156652409197))
* **ci:** resolve shellcheck issues in publish-npm.yml workflow ([e647321](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/e647321c2068e5ab01452d46f17d95b74a15c5b5))
* correct TypeScript build output structure ([c2ae8bd](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c2ae8bd2384e882c6b0ad76262d333a19e106c6b))
* **deps:** update dependency @modelcontextprotocol/sdk to ~1.23.0 ([#279](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/279)) ([3c250a9](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/3c250a94c986af71fef0ac7bed5b47d0ed25477c))
* Docker 'latest' tag only on GitHub Release ([6042d14](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/6042d14dfa7724e7d428d69e46b89d89f32473e7))
* Docker workflow runs only after PR merge ([f71efe5](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/f71efe5cc950cf5449405caf35a622094d752e99))
* **docker:** add platform flag to runtime stage and remove SHA pinning ([#88](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/88)) ([ff2e465](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/ff2e465e4a866e85cc78f6275da0f9eab690e2ae))
* **docker:** change image tags from sha256 to short commit hash ([a8aa618](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/a8aa618b44b0b12e06eb48b0fe615f9449994263))
* **docker:** disable postinstall scripts during dependency installation ([1d70f73](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/1d70f73fc0d0733a050eb8d354f68af7e2240eab))
* **docker:** disable postinstall scripts during dependency installation ([2cb75ca](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/2cb75ca06adddff1f6944a13fcc8603f28f92881))
* **docker:** resolve multi-platform build failures with npm not found ([#87](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/87)) ([7ad619a](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/7ad619a3b9c9eb020d29572bf399636503ed55bc))
* **docker:** skip postinstall scripts and remove redundant platform flag ([f3606ee](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/f3606ee9e79f7fda91d646c964afab0deb85a5f3))
* **docker:** skip postinstall scripts and remove redundant platform flag ([8b6f603](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/8b6f6034ac8956fe512f00d59c03f9c4b897ab47))
* ensure single commit in prepare-release workflow ([#212](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/212)) ([2f87a69](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/2f87a69ef03acd6bde86143c0225ad0370c66420))
* Explicitly include dist/ in Docker build context ([f2d4588](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/f2d4588457e304b162afe10f784421acc620381f)), closes [#184](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/184)
* Explicitly include dist/ in Docker build context ([#292](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/292)) ([dc00bb4](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/dc00bb41593615c3523a62643f813a1d1fee1ef0))
* get_tag_values now returns ALL values from fields.json + presets ([8b3f442](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/8b3f442222be5992fb238303881f89a4f9e13230))
* improve API error handling and org/user detection in cleanup wor… ([d828495](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d828495577f939d4adf1d325abbc5f1808de1cb5))
* improve API error handling and org/user detection in cleanup workflow ([b77b46d](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/b77b46dde86d233fd6f4f82564cd62cea09e4abb))
* improve check_deprecated to return ALL deprecated cases with clear type distinction ([c88954b](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c88954b0b75506d552ef62f83aaf80bfa01a96d7))
* optimize release-it configuration per official docs ([994b3b1](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/994b3b19ceea436402b374725f67ad3fe46a0149))
* Pin GitHub Actions to specific commit SHAs in fuzz workflow ([a11340c](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/a11340c3c40b3857968fb77937e46f8ed675d026))
* regenerate package-lock.json with all platform-specific dependencies ([c52a67c](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c52a67c04e1dd1e5302669b3806fdfb3324a8211))
* Remove custom CodeQL workflow to resolve conflict with default setup ([28c4b4b](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/28c4b4b62239358f9007ffc6ba0afc1192229c47))
* Remove disabled CodeQL workflow and fix branch references ([4f4b418](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/4f4b418e92caedb3c748fe03169b002b358a369f))
* remove dist/ from .dockerignore for Dockerfile.release ([#280](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/280)) ([7f3da52](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/7f3da525da88b464b83f0083345d7192a30f9e95))
* remove double 'v' prefix in manual release workflow tag creation ([ecfa961](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/ecfa961442e2c0a5cd350aa6d45dae79e96d14eb))
* remove unsupported --release-as option from manual release workflow ([5eb3a49](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/5eb3a499d0376913351d15a3b37c26b6b1d999e1))
* remove unsupported --release-as option from manual release workflow ([de99ce0](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/de99ce038a7a85f8497211e56fae9337bbb07f71))
* resolve workflow runs cleanup pagination and counter bug ([5905481](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/5905481353211a155497c342866709e4660e58f4))
* resolve workflow runs cleanup pagination and counter bug ([4c43fb2](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/4c43fb2ee6b8fad4ca2579739d85024a6545f90d))
* Run OpenSSF Scorecard only on schedule, not in PRs ([#175](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/175)) ([85de3df](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/85de3df42f89ba8cdac45e614012200dad82735b))
* search_tags now searches fields.json for complete coverage ([82027e9](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/82027e9862f65f724e356053d36c66cda0923718))
* **security:** address Scorecard alerts with npx and documentation ([895cff8](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/895cff8a641aa7d9b4fa58e31b8f98817420115d))
* **security:** apply least privilege to workflow permissions ([5dc4a6e](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/5dc4a6ec95191abea611e4e248d2dedffdd20ada))
* **security:** pin npm dependencies to specific versions ([0b71587](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/0b715878165eb737064c146dd13da31b0c14dc99))
* **security:** resolve @conventional-changelog/git-client vulnerability ([811f1ce](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/811f1ced99beae56cb8f8738b5c9e7cb21b966cd))
* **security:** resolve @conventional-changelog/git-client vulnerability ([bf119d3](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/bf119d371f3a240e4584ba8c01d555e876fcab1b))
* **security:** split workflow into separate jobs for minimal permissions ([c8a888f](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c8a888f8d3645bb51bd795df943db36c2602629f))
* standardize GitHub Actions to verified SHA versions ([c15f9f4](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c15f9f40783a531aa8f5795382683e44c753bd9e))
* standardize GitHub Actions to verified SHA versions ([39138a3](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/39138a37d463bceb5eebd3830a05d4a7e8e05fb2))
* **tests:** adjust deprecated tags count threshold ([eaf6629](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/eaf6629d099e3f8bdcd09f3bc7d5935b92847423))
* update actions/setup-node to correct v6.0.0 SHA ([cd6cffa](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/cd6cffa581e67f6c1ce2765e102d3eb6698ba315))
* update actions/setup-node to correct v6.0.0 SHA ([166a17f](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/166a17f909876a6aab5be0f408a1db268d9ca9d1))
* update changeset config to use master branch instead of main ([25a603f](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/25a603fc5caf43588f6e150c9bf4e021dc777803))
* URL-encode package names in cleanup workflow API calls ([751e914](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/751e914f40d864889cb6104c5e81ccd0daf8b819))
* URL-encode package names in cleanup workflow API calls ([720c92c](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/720c92c031afbc75b392553319c4b284bf465aef))
* use force push for release branch and tag to handle re-runs ([b5f1a8c](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/b5f1a8c159926cfb2703ef3fca1895431912302e))
* use npm pkg set for reliable version updates in prepare-release workflow ([#208](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/208)) ([e64597f](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/e64597f8920e5b4b003001e5193163cc06e6c23c))
* use npm version + cliff-jumper workaround for custom versions ([7b2516e](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/7b2516e76739a0820b588b6ad0680d11dcaf218c))
* use npm version + cliff-jumper workaround for custom versions ([#210](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/210)) ([d865f6b](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d865f6b74db754e1af45dcd842fce86c800ac1d0))
* use PAT_PACKAGES token and simplify cleanup workflow ([744331a](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/744331a1e0443c33e33e2a812c998bffb2d003e8))
* use PAT_PACKAGES token and simplify cleanup workflow ([5f624fb](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/5f624fbf3adcfcdd16a449a62774a71c192366c2))


### Documentation

* add badges and document skipped tests ([e28be11](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/e28be110ffc80255e106d96344e27e95a1dbabec))
* add code quality, coverage, and release badges to README ([#235](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/235)) ([200ad26](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/200ad269ba04852ed1ed08595849e4139bbaacc7))
* add data sources and validation context analysis to CLAUDE.md ([e7da868](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/e7da86886f5ca670155a3d4912c040bc9ec610b7))
* add GitHub Actions workflow requirements to CLAUDE.md ([e233ba8](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/e233ba83ba2eb4a4318613e164476c88c8762cb8))
* add handler function details and Zod validation examples ([0923419](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/09234193d8638ec71900391cda9d1e7fea639ad8))
* add http transport option and clarify transport naming ([0652e50](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/0652e50f4e8625d501491c7d51042cab37b91afe))
* add http transport option and clarify transport naming ([ff6a043](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/ff6a04390c6cf31eb8a02f7d9bbfa5baf24a6697))
* Add MCP Inspector testing instructions with HTTP/CORS ([ed4e883](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/ed4e883bd9a632d5a4224d8cf9126ce6a67b96ec))
* add MCP SDK migration plan to CLAUDE.md ([d95663a](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d95663a8bb1ec174ce713cca50d621f62c6e96ed))
* add note about integration test failures ([0fe3919](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/0fe3919f353cbcb97efeccbafbde664ee9fe47ad))
* Add Phase 7 (Distribution & Deployment) future plans ([5ae00c2](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/5ae00c2cd14b18d4f22b1cd0f60496b06b309bb5))
* Add schema-builder inspired future enhancements ([18458d7](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/18458d74deb6ad2d2cdb316c003a5d955f93f1fe))
* clarify tool redundancy and testing guidelines in CLAUDE.md ([7d51536](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/7d5153624255786a370caf840be0b043ff287d46))
* clarify tool redundancy and testing guidelines in CLAUDE.md ([4990356](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/4990356cdf47ec491b91ff4b4d484c36b0e81ad2))
* clarify Zod v3 schema format for MCP tools ([ec6dc1c](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/ec6dc1c1c3dffb8031ae1acb3875513896ae73cd))
* **claude:** mark NPM Publishing with Provenance as completed ([9479692](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/94796928bd5573b6f60532f61545c972429856b4))
* cleanup and simplify Future Plans section in CLAUDE.md ([fba90ec](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/fba90ecbf0f97173244020eadf8611e9ff5ce062))
* **contributing:** add comprehensive npm publishing guide ([926b8dd](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/926b8dd8f1f82a8a7dfdd50cf2216760f030a97e))
* enhance README with comprehensive "What is this?" and "What this is NOT" sections ([3984094](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/39840946c66562ee417e1d93ac463405328dd728))
* **readme:** add npm provenance and SLSA badges ([31df2c5](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/31df2c5116186260f7efcd897f59052d18683ca8))
* refresh documentation and implement hybrid version pinning ([8a9e065](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/8a9e065a187094f8ae10eec10b1ee431cae95f12))
* refresh documentation and implement hybrid version pinning ([47fc159](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/47fc159d20b697fdc84beccf85e670bfb9be831d))
* remove hardcoded test counts from README badges ([ec0d40a](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/ec0d40aafe13998d04d682d936111b0667093127))
* remove outdated version numbers and test counts from CLAUDE.md ([294c1a3](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/294c1a3d874c2140ba1c58743de204bc1984a5a1))
* restructure documentation for better organization ([1a245d7](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/1a245d7088671ff18a6beaecc9b0464c8a4485b0))
* restructure documentation for better organization ([aa4a551](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/aa4a5519aeacf6305a3f2063b78b82592cab8de7))
* **security:** add comprehensive security and provenance documentation ([d781f9b](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d781f9b63d80afae610c128f63086c4ee7c85e6f))
* **security:** add Scorecard maintainer annotations ([bd1d776](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/bd1d776eb93a3750be62ad006a785f56d310fdc1))
* update CLAUDE.md to reflect actual codebase state ([#110](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/110)) ([c7b69e4](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/c7b69e4a6e92f4c96331e820c698eb2fc3704aba))
* Update CLAUDE.md with current project state ([3f59241](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/3f5924180a7f8fd556372105521c3daabd8c38c1))
* update CLAUDE.md with parameter destructuring pattern ([146f4d1](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/146f4d11074a11cb122042e585a4c159781eb89a))
* Update MCP badge version in README.md ([cccc306](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/cccc306cc419ef4ae19180c6ca71d224f5b792a6))
* Update MCP badge version in README.md ([#281](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/281)) ([7ffa910](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/7ffa91089276419f761b36170fa0c4252e976314))
* Update README.md with Phase 3 and Phase 4 progress ([b14e9c0](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/b14e9c0574bc1174f1404de35c95e7b3d1bdc2d2))
* update ROADMAP.md to match simplified Future Plans ([4f4140d](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/4f4140d395f95bb1a77524bebbdae5489296ecb6))


### Code Refactoring

* add unified OsmToolDefinition interface ([287d5a0](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/287d5a0ccb673602e88bcb9c5779e8a63c0ac8c9))
* convert SchemaLoader to singleton pattern ([4403292](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/44032929cdbffa9def0117bc0d4e104794c0971c))
* move tool definitions to individual files with handlers ([a091f90](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/a091f90da84de085685f5629c96938e68ab976c0))
* move tool definitions to individual files with handlers ([bb23dc4](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/bb23dc40cc3abc2976a6f08830e1aff5a1d7ba33))
* remove 6 tag query tools and add input trimming to remaining tools ([26431e7](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/26431e703dd3a1f4ef65911a1558357e66361c1f))
* remove old tool registration system ([919efcc](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/919efccedc51911d53f6bbbfdef2a19d757b5665))
* reorganize and rename GitHub workflows ([841625b](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/841625bbee99d5d2fe63b2bf5f3289be3b5bc418))
* replace custom cleanup scripts with ready-made GitHub Actions ([d64f263](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/d64f263fda6e6936b725cc43843fba0164a323fe))
* replace deprecated Server with McpServer ([2c74aa6](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/2c74aa6b331c2590d9c32ff6403a78480129ddcc))
* replace deprecated Server with McpServer ([bdd3d1f](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/bdd3d1f0a85af220b98856d791c3b258c8c252de))
* Simplify Docker workflow with NPM integration ([#295](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/295)) ([a59d19a](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/a59d19a8f951426a27ea4699a1017300519e1fe0))
* simplify tool registration with loop pattern ([1d634ee](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/1d634ee6665402faebffad8840c8575b98de25b4))
* Split integration tests into modular per-tool files ([9c6dba1](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/9c6dba1384326e6a649d8b24afc6487ee8189d06))
* split security workflow into PR and main branch workflows ([#207](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/207)) ([dea133e](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/dea133edefdcbef57686da0dff0b05c65c219c88))
* Split tools and tests into separate files (one tool per file) ([360bacd](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/360bacd9e26edf937a2388e673ad3996b159ef21))
* use parameter destructuring in get_category_tags handler ([f437c18](https://github.com/gander-tools/osm-tagging-schema-mcp/commit/f437c183851e47ddbe91de404012017b7564e327))

## [Unreleased]

### Added

- Implement srvaroa/labeler for automatic PR/issue label management
  - Automatic labeling based on file changes (documentation, tests, core, docker, workflows, etc.)
  - PR size labels (small/medium/large/xlarge) based on line changes
  - Work-in-progress label for draft PRs
  - Branch-based labeling (claude/* branches get "claude code" label)

### Changed

- Remove manual label addition from auto-pr workflow (now handled by labeler)

## [1.0.6] - 2025-11-23

### Miscellaneous

- Replace auto-tag workflow with enhanced auto-release workflow
- Refactor success comment step in auto-release workflow
- Update variable names for clarity in auto-release workflow

## [1.0.5] - 2025-11-23

### Miscellaneous

- Enhance auto-release workflow with error handling and additional permissions

## [1.0.4] - 2025-11-23

### Added

- Introduce automated tag creation and branch validation for secure CI/CD ([#220](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/220))
- Share build artifact between NPM and Docker workflows ([#183](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/183))

### Fixed

- Add Cloudflare Access secrets to Docker publish workflow

### Miscellaneous

- Update auto-pr workflow to latest checkout action and refine PR creation process

## [1.0.3] - 2025-11-22

### Documentation

- Clarify tool redundancy and testing guidelines in CLAUDE.md
- Restructure documentation for better organization

### Fixed

- Ensure single commit in prepare-release workflow ([#212](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/212))
- Optimize release-it configuration per official docs

### Miscellaneous

- Add `.nvmrc` with Node.js version 22 and update `package-lock.json` dependencies
- Update release-it config to use dynamic release branch pattern and remove redundant hooks

## [1.0.2] - 2025-11-21

### Added

- Add safe release workflow with manual approval ([#180](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/180))

### Changed

- Reorganize and rename GitHub workflows
- Split security workflow into PR and main branch workflows ([#207](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/207))

### Documentation

- Add GitHub Actions workflow requirements to CLAUDE.md

### Fixed

- Update changeset config to use master branch instead of main
- Use npm pkg set for reliable version updates in prepare-release workflow ([#208](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/208))
- Use npm version + cliff-jumper workaround for custom versions
- Use npm version + cliff-jumper workaround for custom versions ([#210](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/210))

### Miscellaneous

- Remove manual release workflow file

### Release

- V1.0.2 ([#211](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/211))

## [1.0.1] - 2025-11-20

### Added

- Add manual release workflow with GitHub Actions

### CI/CD

- Install latest npm in publish workflow
- Pin npm version in publish workflow
- Update npm installation reference and enforce npm engine version
- Pin npm installation to version 11.6.3 in publish workflow
- Remove npm cache option from publish workflow
- Downgrade npm to version 11.5.1 in publish workflow
- Fix npm 11 always-auth deprecation warning ([#167](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/167))
- Run tests on merge to master
- Run tests on merge to master ([#169](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/169))

### Documentation

- Remove hardcoded test counts from README badges
- Remove outdated version numbers and test counts from CLAUDE.md
- Enhance README with comprehensive "What is this?" and "What this is NOT" sections

### Fixed

- Change postinstall to prepare for lefthook
- Run OpenSSF Scorecard only on schedule, not in PRs ([#175](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/175))
- Remove unsupported --release-as option from manual release workflow
- Remove double 'v' prefix in manual release workflow tag creation
- Use force push for release branch and tag to handle re-runs

### Miscellaneous

- Update cliff-jumper configuration for GitHub release and PR automation

## [1.0.0] - 2025-11-19

### Added

- **publish**: Add .npmrc with provenance configuration
- **publish**: Enhance workflow with SLSA attestations and SBOM
- Implement Server-Sent Events (SSE) transport
- Add Docker Compose deployment with health check endpoints
- Add lefthook for automated code quality checks
- **release**: Add cliff-jumper and git-cliff for automated releases
- Add ToolDefinition interface for MCP SDK migration
- Migrate get_schema_stats to new MCP SDK tool registration
- Migrate get_categories to new MCP SDK tool registration
- Migrate get_category_tags to new MCP SDK tool registration
- Migrate get_tag_info to new MCP SDK tool registration
- Migrate get_tag_values to new MCP SDK tool registration
- Migrate search_tags to new MCP SDK tool registration
- Migrate get_related_tags and search_presets to new MCP SDK
- Complete MCP SDK migration - all 14 tools migrated
- Use pkg.version from package.json for application version
- Add structured value information with localized titles and descriptions
- Add structured value information with preset names
- Add value descriptions to get_tag_values tool
- Add text format support for validate_tag_collection and suggest_improvements
- Add hourly cleanup workflow for packages and workflow runs
- Update cleanup automation to Auto Cleanup with separate dev/tagged handling ([#115](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/115))
- **transport**: Add SSE keep-alive ping messages for HTTP transport
- **http**: Add CORS support for MCP Inspector UI compatibility
- Remove HTTP/SSE transport support - stdio only
- Remove SSE transport support - HTTP only
- Add comprehensive fuzzing infrastructure with fast-check
- Add webhook notification for Docker latest tag publication

### Bugfix

- Sort MCP tools alphabetically and improve test robustness ([#37](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/37))

### Changed

- Move tool definitions to individual files with handlers
- Replace deprecated Server with McpServer
- Convert SchemaLoader to singleton pattern
- Remove old tool registration system
- Add unified OsmToolDefinition interface
- Use parameter destructuring in get_category_tags handler
- Simplify tool registration with loop pattern
- Remove 6 tag query tools and add input trimming to remaining tools
- Replace custom cleanup scripts with ready-made GitHub Actions

### Docs

- Update CLAUDE.md with current project state
- Update README.md with Phase 3 and Phase 4 progress
- Add schema-builder inspired future enhancements

### Documentation

- **security**: Add comprehensive security and provenance documentation
- **readme**: Add npm provenance and SLSA badges
- **contributing**: Add comprehensive npm publishing guide
- **claude**: Mark NPM Publishing with Provenance as completed
- **security**: Add Scorecard maintainer annotations
- Refresh documentation and implement hybrid version pinning
- Cleanup and simplify Future Plans section in CLAUDE.md
- Update ROADMAP.md to match simplified Future Plans
- Add http transport option and clarify transport naming
- Add MCP SDK migration plan to CLAUDE.md
- Add handler function details and Zod validation examples
- Clarify Zod v3 schema format for MCP tools
- Update CLAUDE.md with parameter destructuring pattern
- Add note about integration test failures
- Add badges and document skipped tests
- Add data sources and validation context analysis to CLAUDE.md
- Update CLAUDE.md to reflect actual codebase state ([#110](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/110))
- Add MCP Inspector testing instructions with HTTP/CORS

### Feature

- Implement get_related_tags tool (Tag Query Tools 3.1 COMPLETED)

### Fix

- Get_tag_values now returns ALL values from fields.json + presets
- Search_tags now searches fields.json for complete coverage
- Docker workflow runs only after PR merge

### Fixed

- **security**: Apply least privilege to workflow permissions
- **security**: Pin npm dependencies to specific versions
- **security**: Split workflow into separate jobs for minimal permissions
- **security**: Address Scorecard alerts with npx and documentation
- **tests**: Adjust deprecated tags count threshold
- **security**: Resolve @conventional-changelog/git-client vulnerability
- **ci**: Remove NODE_AUTH_TOKEN for npm Trusted Publishers ([#80](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/80))
- **docker**: Resolve multi-platform build failures with npm not found ([#87](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/87))
- **docker**: Add platform flag to runtime stage and remove SHA pinning ([#88](https://github.com/gander-tools/osm-tagging-schema-mcp/issues/88))
- **docker**: Skip postinstall scripts and remove redundant platform flag
- **docker**: Disable postinstall scripts during dependency installation
- Add biome-ignore comment for heterogeneous tools array
- Improve check_deprecated to return ALL deprecated cases with clear type distinction
- Correct TypeScript build output structure
- **docker**: Change image tags from sha256 to short commit hash
- Regenerate package-lock.json with all platform-specific dependencies
- Improve API error handling and org/user detection in cleanup workflow
- URL-encode package names in cleanup workflow API calls
- Use PAT_PACKAGES token and simplify cleanup workflow
- Resolve workflow runs cleanup pagination and counter bug
- Add modern entry point fields for bundlephobia compatibility
- Docker 'latest' tag only on GitHub Release
- Remove disabled CodeQL workflow and fix branch references
- Pin GitHub Actions to specific commit SHAs in fuzz workflow
- Add CodeQL workflow and pin dependencies for Scorecard compliance
- Remove custom CodeQL workflow to resolve conflict with default setup

### Miscellaneous

- Prepare package for npm publication
- Update package-lock.json for hybrid version pinning
- Add biome-ignore comments for dynamic translation types
- Simplify Docker image tags

### Refactor

- Split tools and tests into separate files (one tool per file)
- Split integration tests into modular per-tool files

### Security

- Add Phase 7 (Distribution & Deployment) future plans
- Fix OpenSSF Scorecard issues in cleanup workflow
- Pin GitHub Actions to specific commit SHAs

### Testing

- Achieve 100% data coverage - eliminate ALL sampling violations
- Skip parameter validation tests for Zod migration

## Project Information

- **Repository**: https://github.com/gander-tools/osm-tagging-schema-mcp
- **npm Package**: https://www.npmjs.com/package/@gander-tools/osm-tagging-schema-mcp
- **Docker Images**: https://github.com/gander-tools/osm-tagging-schema-mcp/pkgs/container/osm-tagging-schema-mcp
- **License**: GNU General Public License v3.0

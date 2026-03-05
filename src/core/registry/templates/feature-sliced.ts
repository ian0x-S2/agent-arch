import type { Policy } from '../../../schema/policy.schema';

export const featureSlicedTemplate: Policy = {
  "meta": {
    "version": "1.0.0",
    "output_mode": "compact",
    "generated_at": ""
  },
  "stack": {
    "domain": "frontend",
    "pattern": "feature-sliced",
    "state_philosophy": "feature-based",
    "styling_strategy": "utility-first",
    "framework": undefined,
    "component_lib": undefined
  },
  "fsd_config": {
    "segments": ["ui", "model", "api", "lib", "config"]
  },
  "layers": [
    { 
      "id": "app", 
      "allowed_imports": ["pages", "widgets", "features", "entities", "shared"],
      "responsibilities": {
        "owns": ["providers", "routing", "global styles", "app initialization"],
        "must_not": ["contain business logic"],
        "depends_on_abstractions": false
      }
    },
    { 
      "id": "pages", 
      "allowed_imports": ["widgets", "features", "entities", "shared"],
      "responsibilities": {
        "owns": ["composition of widgets for a route"],
        "must_not": ["contain business logic"],
        "depends_on_abstractions": false
      }
    },
    { 
      "id": "widgets", 
      "allowed_imports": ["features", "entities", "shared"],
      "responsibilities": {
        "owns": ["composition of features", "reusable page sections"],
        "must_not": ["contain business logic directly"],
        "depends_on_abstractions": false
      }
    },
    { 
      "id": "features", 
      "allowed_imports": ["entities", "shared"],
      "responsibilities": {
        "owns": ["user interactions with business value (AddToCart, LoginForm)"],
        "must_not": ["import from other features", "know about pages"],
        "depends_on_abstractions": true
      }
    },
    { 
      "id": "entities", 
      "allowed_imports": ["shared"],
      "responsibilities": {
        "owns": ["business objects and their operations (User, Product, Order)"],
        "must_not": ["import from features or above", "contain UI components ideally"],
        "depends_on_abstractions": true
      }
    },
    { 
      "id": "shared", 
      "allowed_imports": [],
      "responsibilities": {
        "owns": ["reusable infra with no business logic (ui-kit, api client, utils)"],
        "must_not": ["import from any other layer", "contain business logic"],
        "depends_on_abstractions": false
      }
    }
  ],
  "import_matrix": {
    "app":      ["pages", "widgets", "features", "entities", "shared"],
    "pages":    ["widgets", "features", "entities", "shared"],
    "widgets":  ["features", "entities", "shared"],
    "features": ["entities", "shared"],
    "entities": ["shared"],
    "shared":   []
  },
  "abstraction_boundaries": [
    {
      "boundary_name": "features→entities",
      "inner_layer": "entities",
      "outer_layer": "features",
      "interface_required": true,
      "interface_location": "model",
      "forbidden_leakage": ["API raw responses", "implementation details of storage"]
    }
  ],
  "domain_rules": {
    "entities_location": "entities",
    "value_objects_allowed": true,
    "entity_rules": {
      "must_be_immutable": true,
      "no_framework_imports": true,
      "validation_location": "factory-function"
    },
    "anemic_model_allowed": false,
    "ubiquitous_language": {
      "enforced": true
    }
  },
  "structural_constraints": {
    "max_component_depth": 5,
    "barrel_exports_required": true,
    "circular_imports": "FORBIDDEN",
    "cross_feature_imports": "via-public-api-only"
  },
  "ui_constraints": {
    "component_max_props": 7,
    "prop_drilling_max_depth": 2,
    "logic_in_components": false,
    "style_co_location": true,
    "allowed_style_extensions": [".css", ".module.css"],
    "prefer_composition": true
  },
  "state_constraints": {
    "global_state_scope": "feature-based",
    "local_state_allowed": true,
    "derived_state_strategy": "selectors",
    "forbidden_patterns": ["direct-mutation", "prop-drilling"]
  },
  "side_effect_boundaries": {
    "allowed_in_layers": ["features", "entities"],
    "forbidden_in_layers": ["ui", "shared"],
    "async_pattern": "async-await",
    "data_fetching_scope": "entities"
  },
  "naming_conventions": {
    "global_strategy": "kebab-case",
    "component": "PascalCase",
    "hook": "camelCase (use* prefix)",
    "store": "camelCase (*Store suffix)",
    "service": "camelCase (*Service suffix)",
    "type": "PascalCase (*Type | *Props suffix)",
    "constant": "SCREAMING_SNAKE_CASE"
  },
  "file_conventions": {
    "types": {
      "component": {
        "pattern": "*.component.tsx",
        "companions": {
          "style":  { "required": true,  "extensions": [".module.css", ".css"] },
          "test":   { "required": true,  "extensions": [".test.tsx", ".test.ts", ".spec.tsx"] }
        }
      },
      "hook": {
        "pattern": "*.hook.ts",
        "companions": {
          "test": { "required": true, "extensions": [".test.ts", ".spec.ts"] }
        }
      },
      "store": {
        "pattern": "*.store.ts",
        "companions": {
          "test": { "required": true, "extensions": [".test.ts", ".spec.ts"] }
        }
      },
      "service": {
        "pattern": "*.service.ts",
        "companions": {
          "test": { "required": false, "extensions": [".test.ts"] }
        }
      },
      "types": {
        "pattern": "*.types.ts"
      },
      "constants": {
        "pattern": "*.constants.ts"
      }
    },
    "colocation": "strict",
    "public_api": {
      "required": true,
      "filename": "index",
      "extensions": [".ts", ".tsx"],
      "expose_internals": false
    },
    "test_placement": "colocated",
    "directory": {
      "max_depth": 5,
      "feature_root_marker": "index.ts"
    },
    "forbidden_patterns": [
      "default-export-on-utility",
      "barrel-in-non-feature-root",
      "named-export-mix-in-component-file"
    ]
  },
  "token_metadata": {
    "estimated_prompt_tokens": 0,
    "compression_applied": false,
    "omitted_sections": []
  }
};

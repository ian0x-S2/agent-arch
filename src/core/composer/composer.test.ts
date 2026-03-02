import { describe, test, expect } from "bun:test";
import { composePolicy } from "../composer";
import type { Layer } from "../../schema/policy.schema";

describe("Composer", () => {
  test("FSD derives state as feature-based automatically", () => {
    const policy = composePolicy({
      pattern: "feature-sliced",
      output_mode: "balanced",
      naming_strategy: "PascalCase",
    });

    expect(policy.stack.state_philosophy).toBe("feature-based");
    expect(policy.state_constraints.global_state_scope).toBe("feature-based");
  });

  test("flat derives state as flexible automatically", () => {
    const policy = composePolicy({
      pattern: "flat",
      output_mode: "balanced",
      naming_strategy: "kebab-case",
    });

    expect(policy.stack.state_philosophy).toBe("flexible");
    expect(policy.state_constraints.global_state_scope).toBe("any");
  });

  test("modular derives state as module-based automatically", () => {
    const policy = composePolicy({
      pattern: "modular",
      output_mode: "balanced",
      naming_strategy: "PascalCase",
    });

    expect(policy.stack.state_philosophy).toBe("module-based");
    expect(policy.state_constraints.global_state_scope).toBe("module-based");
  });

  test("atomic derives state as minimal automatically", () => {
    const policy = composePolicy({
      pattern: "atomic",
      output_mode: "balanced",
      naming_strategy: "kebab-case",
    });

    expect(policy.stack.state_philosophy).toBe("minimal");
    expect(policy.state_constraints.global_state_scope).toBe("minimal");
  });

  test("utility-first styling removes style companions", () => {
    const policy = composePolicy({
      pattern: "feature-sliced",
      output_mode: "balanced",
      naming_strategy: "kebab-case",
      styling_strategy: "utility-first",
    });

    const component = policy.file_conventions.types.component!;
    expect(component.companions?.style).toBeUndefined();
    expect(policy.ui_constraints.style_co_location).toBe(false);
    expect(policy.ui_constraints.allowed_style_extensions).toHaveLength(0);
  });

  test("scoped styling adds companion .module.css required", () => {
    const policy = composePolicy({
      pattern: "feature-sliced",
      output_mode: "balanced",
      naming_strategy: "kebab-case",
      styling_strategy: "scoped",
    });

    const component = policy.file_conventions.types.component!;
    expect(component.companions?.style?.required).toBe(true);
    expect(component.companions?.style?.extensions).toContain(".module.css");
    expect(policy.ui_constraints.style_co_location).toBe(true);
  });

  test("css-in-js removes companion but keeps co_location true", () => {
    const policy = composePolicy({
      pattern: "modular",
      output_mode: "balanced",
      naming_strategy: "PascalCase",
      styling_strategy: "css-in-js",
    });

    const component = policy.file_conventions.types.component!;
    expect(component.companions?.style).toBeUndefined();
    expect(policy.ui_constraints.style_co_location).toBe(true);
    expect(policy.ui_constraints.allowed_style_extensions).toHaveLength(0);
  });

  test("atomic + utility-first has no style companions", () => {
    const policy = composePolicy({
      pattern: "atomic",
      output_mode: "balanced",
      naming_strategy: "kebab-case",
      styling_strategy: "utility-first",
    });

    for (const typeDef of Object.values(policy.file_conventions.types)) {
      expect(typeDef.companions?.style).toBeUndefined();
    }
  });

  test("FSD with PascalCase naming applies correct file patterns", () => {
    const policy = composePolicy({
      pattern: "feature-sliced",
      output_mode: "balanced",
      naming_strategy: "PascalCase",
    });

    expect(policy.file_conventions.types.component?.pattern).toBe(
      "*Component.tsx",
    );
    expect(policy.file_conventions.types.hook?.pattern).toBe("*Hook.ts");

    const featuresLayer = policy.layers.find((l: Layer) => l.id === "features");
    expect(featuresLayer?.responsibilities).toBeDefined();
    expect(featuresLayer?.responsibilities?.owns[0]).toContain(
      "user interactions with business value",
    );

    expect(policy.fsd_config?.segments).toContain("ui");
  });

  test("flat pattern disables barrel exports regardless of template default", () => {
    const policy = composePolicy({
      pattern: "flat",
      output_mode: "balanced",
      naming_strategy: "kebab-case",
    });
    expect(policy.structural_constraints.barrel_exports_required).toBe(false);
  });

  test("modular template has correct import_matrix (no self-import)", () => {
    const policy = composePolicy({
      pattern: "modular",
      output_mode: "balanced",
      naming_strategy: "PascalCase",
    });

    const modulesImports = policy.import_matrix["modules"];
    expect(modulesImports).not.toContain("modules");
    expect(modulesImports).toContain("shared");
  });

  test("composePolicy preserves responsibilities through validation", () => {
    const policy = composePolicy({
      pattern: "feature-sliced",
      output_mode: "compact",
      naming_strategy: "kebab-case",
    });

    const appLayer = policy.layers.find((l: Layer) => l.id === "app");
    expect(appLayer?.responsibilities).toBeDefined();
    expect(appLayer?.responsibilities?.owns).toContain("providers");
  });

  test("flat template has meaningful forbidden_patterns", () => {
    const policy = composePolicy({
      pattern: "flat",
      output_mode: "balanced",
      naming_strategy: "kebab-case",
    });

    expect(policy.state_constraints.forbidden_patterns.length).toBeGreaterThan(
      0,
    );
    expect(policy.file_conventions.forbidden_patterns.length).toBeGreaterThan(
      0,
    );
  });

  test("throws on unknown pattern", () => {
    expect(() =>
      composePolicy({
        pattern: "non-existent",
        output_mode: "balanced",
        naming_strategy: "kebab-case",
      }),
    ).toThrow("Template not found: non-existent");
  });

  test("throws on invalid output_mode", () => {
    expect(() =>
      composePolicy({
        pattern: "flat",
        output_mode: "invalid-mode" as any,
        naming_strategy: "kebab-case",
      }),
    ).toThrow();
  });
});

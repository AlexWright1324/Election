{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    pre-commit-hooks-nix = {
      url = "github:cachix/pre-commit-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
  };

  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.pre-commit-hooks-nix.flakeModule ];

      systems = import inputs.systems;

      perSystem =
        { config, pkgs, ... }:
        {
          pre-commit.settings.hooks = {
            nil.enable = true;
            nixfmt-rfc-style.enable = true;
          };

          devShells.default = pkgs.mkShell {
            inputsFrom = [ config.pre-commit.devShell ];
            packages = with pkgs; [
              nodejs
              bun
              act # Testing Workflows - Requires Docker (not Podman)
            ];
            shellHook = with pkgs; ''
              export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
              export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine"
              export PRISMA_SCHEMA_ENGINE_BINARY="${prisma-engines}/bin/schema-engine"
              export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
              export PRISMA_INTROSPECTION_ENGINE_BINARY="${prisma-engines}/bin/introspection-engine"
              export LD_LIBRARY_PATH="${stdenv.cc.cc.lib}/lib"
              export DATABASE_URL="file:../store/db.sqlite"
            '';
          };

          formatter = pkgs.nixfmt-rfc-style;
        };
    };
}

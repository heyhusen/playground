{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = [
    pkgs.go
    pkgs.gopls
    pkgs.gotools
    pkgs.delve
    pkgs.nodejs
		pkgs.nodePackages.pnpm
    pkgs.nodePackages.typescript-language-server
  ];
}

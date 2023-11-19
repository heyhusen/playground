{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = [
    pkgs.go
    pkgs.nodejs
		pkgs.nodePackages.pnpm
  ];
}

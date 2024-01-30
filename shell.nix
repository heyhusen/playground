{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = [
    pkgs.jsonnet-language-server
    pkgs.yaml-language-server
    pkgs.nil
    pkgs.nixpkgs-fmt
    pkgs.vscode-langservers-extracted
    pkgs.dockerfile-language-server-nodejs
    pkgs.marksman
    pkgs.go
    pkgs.gopls
    pkgs.gotools
    pkgs.delve
    pkgs.nodejs_20
		pkgs.nodePackages.pnpm
    pkgs.nodePackages.typescript-language-server
    pkgs.nodePackages.bash-language-server
  ];
}

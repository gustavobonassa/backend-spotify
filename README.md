Esse repositorio serve como backend para:
```
https://github.com/gustavobonassa/frontend-spotify
```


## Como rodar

### Nuvem

Para salvar as imagens e musicas foi utilizado o cloudinary, você pode criar uma conta e adicionar as informações no .env.example

```
https://cloudinary.com/
```
### Migrações

Você pode escolher qualquer banco de dados que preferir: MySQL, postgresql...

Preencha as informações do seu banco com base no .env.example

Instale o adonis-cli seguindo o tutorial

```
https://legacy.adonisjs.com/docs/4.1/installation
```

Então você pode rodar o seguinte comando para criar as tabelas
```js
adonis migration:run
```

### Rodando
Remova o .example do final do .env então você pode rodar no terminal:
```
adonis serve --dev
```

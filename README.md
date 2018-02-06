# changelogiterator
## Introduction
This is a simple iterator for the changes happening in userstate in https://userservice.jppol.dk 

It will be necessary to receive a set of credentials for the webservice before this project can be used. 

The client is generated from the swagger def using https://editor.swagger.io - The generated classes are available as a repo here
https://github.com/faester/userservicejppol.dk 

## What is the changelog
The changelog is a simple iterator for CRUD operations happening to users at userservice.jppol.dk. It is meant to enable clients to 
subscribe to changes thus synchronizing user state and not least deleting user data if the user choose to delete her account.

The changelog is ordered by a logical time stamp. Clients should keep track of the maximum timestamp seen and provide this number when
querying the changelog. This way only new changes will be returned. By polling the change log at reasonable intervals it is possible to 
be kept up-to-date with the users states at all times. 

NB: The changelog does not return any actual userstate. The respone only contain logical and actual times, the identifier of the affected
user and and operation type. User state can then be retrieved by calling userservice seperately. 

## Setting up
The program will need to be setup at first run. 

```
  Usage: main [options]


  Options:

    -V, --version              output the version number
    -i, --id [value]           auth.jppol.dk client id
    -s, --secret [value]       auth.jppol.dk client secret
    -A, --auth [value]         Authorization endpoint
    -U, --userservice [value]  Userservice endpoint
    -m, --maxChange [value]    Minimum change number
    -M, --findMaximum
    -h, --help                 output usage information
```
Authorization endpoint should usually be `https://auth.jppol.dk/connect/token`

Userservice endpoint `https://userservice.jppol.dk`


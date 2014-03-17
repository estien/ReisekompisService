ReisekompisService
==================

Reisekompis mellomlag skrevet i Node.js

[Fagdagpresentasjon finnes her](https://docs.google.com/presentation/d/1IBE90UlJJIUBB_Gbc5-Py_6htXVgtLRdZR99ge6LRy8/edit?usp=sharing)

## A Ruter API-abstraction service

This node.js-based application works as an abstraction layer between on-the-road mobile apps and [Ruter's API](http://labs.trafikanten.no/how-to-use-the-api.aspx). 

## Set up your development environment

This application is pretty easy to set up locally. You need node and npm installed, and that's about it!

If you don't have node and npm installed, you can check out [these install scripts](https://gist.github.com/isaacs/579814).

Once you've cloned the project, simply run ``npm install`` to fetch the dependencies.

To run, enter ``node app.js`` into your favorite terminal.

## Endpoints

The application have the following JSON-producing endpoints available:

``GET /search/:query``

Searches Ruter's API for a stop. 
Returns a list of stops and the lines that stop there.

``GET /poll/:stopId/:lineId``

Polls a stop for a given line. 

``POST /poll``

Polls a set of stops and lines for the next departures.

Parameter form:

    [ 
        {
            id: 3010200, // Stop id
            lines: [ 1, 2 ] // Array of line IDs
        }, ...
    ] 

Returns a list of line departures at the specified stop.
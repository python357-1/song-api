const express = require('express')
const sqlite = require('sqlite3');
const { json } = require('body-parser');
require('dotenv').config()

const db = new sqlite.Database('songsAPI');

const app = express()

const port = process.env.PORT || 5001
const jsonParser = json()

app.get('/songs', (req, res) => {
    db.serialize(function () {
        db.all("SELECT * FROM songs", function (err, rows) {
            if (err) {
                console.log(err)
            }
            res.json(rows)
        })
    })
})

app.get('/song/', jsonParser, (req, res) => {
    if (req.body.id) {
        db.serialize(function () {
            db.get('SELECT * FROM SONGS WHERE id = ' + req.body.id, function (err, row) {
                if (err) {
                    res.json({ err: err })
                } else {
                    res.json({ row })
                }
            })
        })
    } else {
        res.json({ err: "no id found" })
    }
})

app.post('/song/', jsonParser, (req, res) => {
    if (!req.body.title || !req.body.album || !req.body.artist) {
        res.json({ err: "missing a required field" });
    } else {
        db.serialize(function () {
            let { title, album, artist, track_num, length, source } = req.body;
            db.run("INSERT INTO songs (title, album, artist, track_num, length, source) VALUES (" + `\'${title}\', \'${album}\', \'${artist}\', \'${track_num}\', \'${length}\', \'${source}\')`);
        });
        res.json(req.body);
    }
})

app.put('/song/', jsonParser, (req, res) => {
    if (req.body.id) {
        db.serialize(function () {
            db.get("SELECT * FROM songs WHERE id = " + req.body.id.toString(), function (err, row) {
                if (err) {
                    console.log(err)
                } else {
                    function splitAndJoin(arr1, arr2) {
                        // assumes arrays are of the same length
                        let tempArr = [];
                        let x = 0;
                        while (x < arr1.length) {
                            if (typeof arr2[x] == 'number') {
                                tempArr.push(`${arr1[x]} = ${arr2[x]}`)
                            } else {
                                tempArr.push(`${arr1[x]} = '${arr2[x]}'`)
                            }
                            x++;
                        }

                        if (tempArr.length < 2) {
                            return tempArr.join(' ')
                        } else {
                            return tempArr.join(', ')
                        }
                    }

                    let keysArr = [];
                    let valuesArr = [];
                    Object.keys(req.body).forEach(e => {
                        if (e != "id") {
                            keysArr.push(e)
                            valuesArr.push(req.body[e])
                        }
                    })

                    db.run("UPDATE songs SET " + splitAndJoin(keysArr, valuesArr) + " WHERE id = " + req.body.id, function (err) {
                        if (err) {
                            res.json(err)
                        } else {
                            res.json({ success: 'row updated'})
                        }
                    })
                }
            });
        });
    }
})

app.delete('/song/', jsonParser, (req, res) => {
    db.get('SELECT * FROM SONGS WHERE id = ' + req.body.id, function (err, row) {
        if (row) {
            db.run("DELETE FROM songs WHERE id = " + req.body.id, function (err, row) {
                res.json({ success: "row deleted" })
            })
        } else {
            res.json({ err: "row not found" })
        }
    });
});

app.listen(port, (req, res) => {
    console.log(`listening on ${port}`);
})
// Project dependencies
const express = require('express')
const bodyparser = require('body-parser')
const path = require('path')
const chigari = express();
const ejs = require('ejs')
const moment = require('moment');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer')
const dbconfig = require('./dbconfig/db')
const Cause = require('./models/cause');
const Event = require('./models/event');
const Gallery = require('./models/gallery');
const News = require('./models/news');
const Partner = require('./models/partner');
const Profile = require('./models/profile');
var dateTime = require('node-datetime');
const AWS = require('aws-sdk');

//const ipfsClient = require('ipfs-http-client');
const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId: '694913CD627F09E752F5',
    secretAccessKey: 'GzPoQE79IqbAHBQFROSvtm3txG3RMx2QBNj7cNQF',
    endpoint: 'https://s3.filebase.com',
    region: 'us-east-1',
    s3ForcePathStyle: true
});

// view engine setup
chigari.set('views', path.join(__dirname, 'views'));
chigari.set('view engine', 'ejs');
chigari.use(bodyparser.json());
chigari.use(bodyparser.urlencoded({ extended: true }));
chigari.use(express.static(path.resolve(__dirname + '/')));

// image upload and storage setup
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'imguploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })

// get routes
chigari.get('/', async (req, res) => {
    const cause = await Cause.find({})
    const event = await Event.find({})
    const news = await News.find({})
    const gallery = await Gallery.find({})
    const partner = await Partner.find({})
    res.render('index', {
        news: news, event: event, cause: cause, gallery: gallery, partner: partner
    })
})

chigari.get('/admin-dashboard', async (req, res) => {
    const cause = await Cause.find({})
    const profile = await Profile.find({})
    const event = await Event.find({})
    const news = await News.find({})
    const gallery = await Gallery.find({})
    const partner = await Partner.find({})
    console.log(cause, profile, event, news, gallery, partner)
    res.render('admin/dashboard', {
        news: news, event: event,
        profile: profile, cause: cause, gallery: gallery,
        partner: partner
    })
})

chigari.get('/page-not-found', async (req, res) => {
    res.render('404')
})

chigari.get('/about', async (req, res) => {
    res.render('about')
})

chigari.get('/causes', async (req, res) => {
    const cause = await Cause.find({})
    res.render('allcause', { cause: cause })
})

chigari.get('/contact', async (req, res) => {
    res.render('contact')
})

chigari.get('/event', async (req, res) => {
    const event = await Event.find({})
    res.render('allevent', { event: event })
})

chigari.get('/gallery', async (req, res) => {
    const gallery = await Gallery.find({})
    res.render('gallery', { gallery: gallery })
})

chigari.get('/team', async (req, res) => {
    const profile = await Profile.find({})
    res.render('team', { profile: profile })
})

chigari.get('/our-work', async (req, res) => {
    res.render('our-work')
})

chigari.get('/partners', async (req, res) => {

    const partner = await Partner.find({})
    res.render('partners', { partners: partner })
})

chigari.get('/blog-single', async (req, res) => {
    res.render('blog-single')
})

chigari.get('/blog-grid', async (req, res) => {
    res.render('blog-grid')
})

chigari.get('/blog-right-sidebar', async (req, res) => {
    res.render('blog-right-sidebar')
})

chigari.get('/create-event', async (req, res) => {
    res.render('admin/create-event')
})

chigari.get('/create-news', async (req, res) => {
    res.render('admin/create-news')
})

chigari.get('/create-profile', async (req, res) => {
    res.render('admin/create-member')
})

chigari.get('/create-cause', async (req, res) => {
    res.render('admin/create-causes')
})

chigari.get('/update-gallery', async (req, res) => {
    res.render('admin/update-gallery')
})

chigari.get('/update-partner', async (req, res) => {
    res.render('admin/update-logo')
})

chigari.get('/all-events', async (req, res) => {
    const event = await Event.find({})
    res.render('allevent', { event: event })
})

chigari.get('/all-news', async (req, res) => {
    const news = await News.find({})
    res.render('allnews', { news: news })
})

chigari.get('/all-causes', async (req, res) => {
    const cause = await Cause.find({})
    res.render('allcause', { cause: cause })
})

chigari.get('/view-event/:id', async (req, res) => {
    const event = await Event.findOne({ _id: req.params.id })
    res.render('viewevent', { event: event })
})

chigari.get('/view-news/:id', async (req, res) => {
    const news = await News.findOne({ _id: req.params.id })
    res.render('viewnews', { news: news })
})

chigari.get('/view-cause/:id', async (req, res) => {
    const cause = await Cause.findOne({ _id: req.params.id })
    console.log(cause)
    res.render('viewcause', { cause: cause })
})

// post routes
chigari.post('/create-event', upload.single('image'), async (req, res) => {
    console.log(req.body)
    var img = require('fs').readFileSync('./imguploads/' + req.file.originalname);
    console.log(img)

    console.log(req.file)
    const params = {
        Bucket: 'swagger',
        Key: 'imguploads/' + req.file.originalname,
        ContentType: 'image/png',
        Body: img,
        ACL: 'public-read',
    };
    const request = s3.putObject(params);
    const aaa = await request.send();
    setTimeout(function () {
        const paramss = {
            Key: 'imguploads/' + req.file.originalname,
            Bucket: "swagger",
        };
        s3.getObject(paramss, function (error, data) {
            if (error) {
                console.log(error);
                res.send({ success: error })
            } else {
                console.log("Returning contents from ");
                const cid = data.Metadata.cid
                const url = 'https://ipfs.io/ipfs/' + cid
                const event = new Event({
                    image: url,
                    date: req.body.date,
                    time: req.body.time,
                    title: req.body.title,
                    content: req.body.content,
                    venue: req.body.venue
                })

                Event.create(event).then((event, err) => {
                    console.log(event)
                    if (err) {
                        res.send(err)
                    }
                    else {
                        res.send({ success: true })
                    }
                })

            }
        });
    }, 5000);



})

chigari.post('/create-news', upload.single('image'), async (req, res) => {
    console.log(req.body)
    var img = require('fs').readFileSync('./imguploads/' + req.file.originalname);
    console.log(img)

    console.log(req.file)

    const params = {
        Bucket: 'swagger',
        Key: 'imguploads/' + req.file.originalname,
        ContentType: 'image/png',
        Body: img,
        ACL: 'public-read',
    };

    const request = s3.putObject(params);
    const aaa = await request.send();
    setTimeout(function () {
        const paramss = {
            Key: 'imguploads/' + req.file.originalname,
            Bucket: "swagger",

        };

        s3.getObject(paramss, function (error, data) {
            if (error) {
                console.log(error);
                res.send({ success: error })
            } else {
                console.log("Returning contents from ");
                const cid = data.Metadata.cid
                const url = 'https://ipfs.io/ipfs/' + cid
                var dt = dateTime.create();
                var formatted = dt.format('Y-m-d H:M:S');
                console.log(formatted);
                const news = new News({
                    image: url,
                    title: req.body.title,
                    content: req.body.content,
                    datePublished: formatted
                })

                News.create(news).then((news, err) => {
                    console.log(news)
                    if (err) {
                        res.send(err)
                    }
                    else {
                        res.send({ success: true })
                    }
                })

            }
        });
    }, 5000);


})

chigari.post('/create-profile/', upload.single('image'), async (req, res) => {

    console.log(req.body)
    var img = require('fs').readFileSync('./imguploads/' + req.file.originalname);
    console.log(img)

    console.log(req.file)

    const params = {
        Bucket: 'swagger',
        Key: 'imguploads/' + req.file.originalname,
        ContentType: 'image/png',
        Body: img,
        ACL: 'public-read',
    };

    const request = s3.putObject(params);
    const aaa = await request.send();
    setTimeout(function () {
        const paramss = {
            Key: 'imguploads/' + req.file.originalname,
            Bucket: "swagger",

        };

        s3.getObject(paramss, function (error, data) {
            if (error) {
                console.log(error);
                res.send({ success: error })
            } else {
                console.log("Returning contents from ");
                const cid = data.Metadata.cid
                const url = 'https://ipfs.io/ipfs/' + cid
                const profile = new Profile({
                    image: url,
                    membershipType: req.body.memberType,
                    name: req.body.name,
                    position: req.body.position,
                    profile: req.body.profile
                })

                Profile.create(profile).then((profile, err) => {
                    console.log(profile)
                    if (err) {
                        res.send(err)
                    }
                    else {
                        res.send({ success: true })
                    }
                })

            }
        });
    }, 5000);


})

chigari.post('/create-cause/', upload.single('image'), async (req, res) => {
    console.log(req.body)
    var img = require('fs').readFileSync('./imguploads/' + req.file.originalname);
    console.log(img)

    console.log(req.file)

    const params = {
        Bucket: 'swagger',
        Key: 'imguploads/' + req.file.originalname,
        ContentType: 'image/png',
        Body: img,
        ACL: 'public-read',
    };

    const request = s3.putObject(params);
    const aaa = await request.send();
    setTimeout(function () {
        const paramss = {
            Key: 'imguploads/' + req.file.originalname,
            Bucket: "swagger",

        };

        s3.getObject(paramss, function (error, data) {
            if (error) {
                console.log(error);
                res.send({ success: error })
            } else {
                console.log("Returning contents from ");
                const cid = data.Metadata.cid
                const url = 'https://ipfs.io/ipfs/' + cid
                const cause = new Cause({
                    image: url,
                    nAmount: req.body.nAmount,
                    rAmount: req.body.rAmount,
                    title: req.body.title,
                    content: req.body.content
                })

                Cause.create(cause).then((cause, err) => {
                    console.log(cause)
                    if (err) {
                        res.send(err)
                    }
                    else {
                        res.send({ success: true })
                    }
                })

            }
        });
    }, 5000);


})

chigari.post('/update-gallery', upload.single('image'), async (req, res) => {

    var img = require('fs').readFileSync('./imguploads/' + req.file.originalname);
    console.log(img)

    console.log(req.file)

    const params = {
        Bucket: 'swagger',
        Key: 'imguploads/' + req.file.originalname,
        ContentType: 'image/png',
        Body: img,
        ACL: 'public-read',
    };

    const request = s3.putObject(params);
    const aaa = await request.send();
    setTimeout(function () {
        const paramss = {
            Key: 'imguploads/' + req.file.originalname,
            Bucket: "swagger",

        };

        s3.getObject(paramss, function (error, data) {
            if (error) {
                console.log(error);
                res.send({ success: error })
            } else {
                console.log("Returning contents from ");
                const cid = data.Metadata.cid
                const url = 'https://ipfs.io/ipfs/' + cid
                const gallery = new Gallery({
                    image: url
                })
                Gallery.create(gallery).then((gallery, err) => {
                    console.log(gallery)
                    if (err) {
                        res.send(err)
                    }
                    else {
                        res.send({ success: true })
                    }
                })

            }
        });
    }, 5000);

    //   console.log(mmm)

})



chigari.post('/update-partner', upload.single('image'), async (req, res) => {

    var img = require('fs').readFileSync('./imguploads/' + req.file.originalname);
    console.log(img)

    console.log(req.file)

    const params = {
        Bucket: 'swagger',
        Key: 'imguploads/' + req.file.originalname,
        ContentType: 'image/png',
        Body: img,
        ACL: 'public-read',
    };

    const request = s3.putObject(params);
    const aaa = await request.send();
    setTimeout(function () {
        const paramss = {
            Key: 'imguploads/' + req.file.originalname,
            Bucket: "swagger",

        };

        s3.getObject(paramss, function (error, data) {
            if (error) {
                console.log(error);
                res.send({ success: error })
            } else {
                console.log("Returning contents from ");
                const cid = data.Metadata.cid
                const url = 'https://ipfs.io/ipfs/' + cid
                const partner = new Partner({
                    image: url,
                    sitelink: req.body.siteLink
                })

                Partner.create(partner).then((partner, err) => {
                    console.log(partner)
                    if (err) {
                        res.send(err)
                    }
                    else {
                        res.send({ success: true })
                    }
                })

            }
        });
    }, 5000);
})

// edit routes
chigari.post('/edit-cause/:id', upload.single('image'), async (req, res) => {
    if (req.file == undefined) {
        Cause.findByIdAndUpdate({ _id: req.params.id }, {
            nAmount: req.body.nAmount,
            rAmount: req.body.rAmount,
            title: req.body.title,
            content: req.body.content
        }, function (err, cause) {
            if (err) {
                res.send({ success: false })
            }
            else {
                console.log(cause);
                res.send({ success: true })
            }

        })
    }
    else {
        console.log(req.body)
        var img = require('fs').readFileSync('./imguploads/' + req.file.originalname);
        console.log(img)

        console.log(req.file)

        const params = {
            Bucket: 'swagger',
            Key: 'imguploads/' + req.file.originalname,
            ContentType: 'image/png',
            Body: img,
            ACL: 'public-read',
        };

        const request = s3.putObject(params);
        const aaa = await request.send();
        setTimeout(function () {
            const paramss = {
                Key: 'imguploads/' + req.file.originalname,
                Bucket: "swagger",

            };

            s3.getObject(paramss, function (error, data) {
                if (error) {
                    console.log(error);
                    res.send({ success: error })
                } else {
                    console.log("Returning contents from ");
                    const cid = data.Metadata.cid
                    const url = 'https://ipfs.io/ipfs/' + cid
                    Cause.findByIdAndUpdate({ _id: req.params.id }, {
                        image: url,
                        nAmount: req.body.nAmount,
                        rAmount: req.body.rAmount,
                        title: req.body.title,
                        content: req.body.content
                    }, function (err, cause) {
                        if (err) {
                            res.send({ success: false })
                        }
                        else {
                            console.log(cause);
                            res.send({ success: true })
                        }

                    })

                }
            });
        }, 5000);

    }
})

chigari.post('/edit-profile/:id', upload.single('image'), async (req, res) => {



    if (req.file == undefined) {
        Profile.findByIdAndUpdate({ _id: req.params.id }, {
            membershipType: req.body.memberType,
            name: req.body.name,
            position: req.body.position,
            profile: req.body.profile
        }, function (err, profile) {
            if (err) {
                res.send({ success: false })
            }
            else {
                console.log(profile);
                res.send({ success: true })
            }

        })
    }

    else {
        console.log(req.body)
        var img = require('fs').readFileSync('./imguploads/' + req.file.originalname);
        console.log(img)

        console.log(req.file)

        const params = {
            Bucket: 'swagger',
            Key: 'imguploads/' + req.file.originalname,
            ContentType: 'image/png',
            Body: img,
            ACL: 'public-read',
        };

        const request = s3.putObject(params);
        const aaa = await request.send();
        setTimeout(function () {
            const paramss = {
                Key: 'imguploads/' + req.file.originalname,
                Bucket: "swagger",

            };

            s3.getObject(paramss, function (error, data) {
                if (error) {
                    console.log(error);
                    res.send({ success: error })
                } else {
                    console.log("Returning contents from ");
                    const cid = data.Metadata.cid
                    const url = 'https://ipfs.io/ipfs/' + cid
                    Profile.findByIdAndUpdate({ _id: req.params.id }, {
                        image: url,
                        membershipType: req.body.memberType,
                        name: req.body.name,
                        position: req.body.position,
                        profile: req.body.profile
                    }, function (err, profile) {
                        if (err) {
                            res.send({ success: false })
                        }
                        else {
                            console.log(profile);
                            res.send({ success: true })
                        }

                    })

                }
            });
        }, 5000);


        ////////

    }
    ///////////// 
})

chigari.post('/edit-event/:id', upload.single('image'), async (req, res) => {
    if (req.file == undefined) {
        Event.findByIdAndUpdate({ _id: req.params.id }, {
            date: req.body.date,
            time: req.body.time,
            title: req.body.title,
            content: req.body.content,
            venue: req.body.venue
        }, function (err, event) {
            if (err) {
                res.send({ success: false })
            }
            else {
                console.log(event);
                res.send({ success: true })
            }

        })
    }
    else {
        console.log(req.body)
        var img = require('fs').readFileSync('./imguploads/' + req.file.originalname);
        console.log(img)

        console.log(req.file)

        const params = {
            Bucket: 'swagger',
            Key: 'imguploads/' + req.file.originalname,
            ContentType: 'image/png',
            Body: img,
            ACL: 'public-read',
        };

        const request = s3.putObject(params);
        const aaa = await request.send();
        setTimeout(function () {
            const paramss = {
                Key: 'imguploads/' + req.file.originalname,
                Bucket: "swagger",

            };

            s3.getObject(paramss, function (error, data) {
                if (error) {
                    console.log(error);
                    res.send({ success: error })
                } else {
                    console.log("Returning contents from ");
                    const cid = data.Metadata.cid
                    const url = 'https://ipfs.io/ipfs/' + cid
                    Event.findByIdAndUpdate({ _id: req.params.id }, {
                        image: url,
                        date: req.body.date,
                        time: req.body.time,
                        title: req.body.title,
                        content: req.body.content,
                        venue: req.body.venue
                    }, function (err, event) {
                        if (err) {
                            res.send({ success: false })
                        }
                        else {
                            console.log(event);
                            res.send({ success: true })
                        }

                    })

                }
            });
        }, 5000);

        //////////////////

    }
})

chigari.post('/edit-news/:id', upload.single('image'), async (req, res) => {
    if (req.file == undefined) {
        News.findByIdAndUpdate({ _id: req.params.id }, {
            title: req.body.title,
            content: req.body.content
        }, function (err, news) {
            if (err) {
                res.send({ success: false })
            }
            else {
                console.log(news);
                res.send({ success: true })
            }

        })
    }
    else {
        console.log(req.body)
        var img = require('fs').readFileSync('./imguploads/' + req.file.originalname);
        console.log(img)

        console.log(req.file)

        const params = {
            Bucket: 'swagger',
            Key: 'imguploads/' + req.file.originalname,
            ContentType: 'image/png',
            Body: img,
            ACL: 'public-read',
        };

        const request = s3.putObject(params);
        const aaa = await request.send();
        setTimeout(function () {
            const paramss = {
                Key: 'imguploads/' + req.file.originalname,
                Bucket: "swagger",

            };

            s3.getObject(paramss, function (error, data) {
                if (error) {
                    console.log(error);
                    res.send({ success: error })
                } else {
                    console.log("Returning contents from ");
                    const cid = data.Metadata.cid
                    const url = 'https://ipfs.io/ipfs/' + cid
                    News.findByIdAndUpdate({ _id: req.params.id }, {
                        image: url,
                        title: req.body.title,
                        content: req.body.content
                    }, function (err, news) {
                        if (err) {
                            res.send({ success: false })
                        }
                        else {
                            console.log(news);
                            res.send({ success: true })
                        }

                    })

                }
            });
        }, 5000);


    }
})

// delete routes
chigari.post('/delete-cause/:id', async (req, res) => {

    Cause.findByIdAndRemove({ _id: req.params.id }, function (err, cause) {
        if (err) {
            res.send({ success: false })
        }
        else {
            console.log(cause);
            res.send({ success: true })
        }

    })
})

chigari.post('/delete-profile/:id', async (req, res) => {

    Profile.findByIdAndRemove({ _id: req.params.id }, function (err, profile) {
        if (err) {
            res.send({ success: false })
        }
        else {
            console.log(profile);
            res.send({ success: true })
        }

    })
})

chigari.post('/delete-event/:id', async (req, res) => {

    Event.findByIdAndRemove({ _id: req.params.id }, function (err, event) {
        if (err) {
            res.send({ success: false })
        }
        else {
            console.log(event);
            res.send({ success: true })
        }

    })
})

chigari.post('/delete-news/:id', async (req, res) => {

    News.findByIdAndRemove({ _id: req.params.id }, function (err, news) {
        if (err) {
            res.send({ success: false })
        }
        else {
            console.log(news);
            res.send({ success: true })
        }

    })
})

chigari.post('/delete-picture/:id', async (req, res) => {

    Gallery.findByIdAndRemove({ _id: req.params.id }, function (err, gallery) {
        if (err) {
            res.send({ success: false })
        }
        else {
            console.log(gallery);
            res.send({ success: true })
        }

    })
})

chigari.post('/delete-partner/:id', async (req, res) => {

    Partner.findByIdAndRemove({ _id: req.params.id }, function (err, partner) {
        if (err) {
            res.send({ success: false })
        }
        else {
            console.log(partner);
            res.send({ success: true })
        }

    })
})

// edit page routes
chigari.get('/edit-cause/:id', async (req, res) => {
    const cause = await Cause.findOne({ _id: req.params.id })
    res.render('admin/edit-cause', { cause: cause })
})

chigari.get('/edit-profile/:id', async (req, res) => {

    const profile = await Profile.findOne({ _id: req.params.id })
    res.render('admin/edit-member', { profile: profile })
})

chigari.get('/edit-event/:id', async (req, res) => {
    const event = await Event.findOne({ _id: req.params.id })
    res.render('admin/edit-event', { event: event })
})

chigari.get('/edit-news/:id', async (req, res) => {
    const news = await News.findOne({ _id: req.params.id })
    res.render('admin/edit-news', { news: news })
})
chigari.listen(process.env.PORT || 7000)
console.log('server is listening at port 7000');
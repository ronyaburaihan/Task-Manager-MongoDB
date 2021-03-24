const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users', auth, async (req, res) => {
    try {
        const user = await User.find({})
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowUpdates = ['name', 'email', 'password', 'age']
    const isValidToUpdate = updates.every((update) => allowUpdates.includes(update))

    if (!isValidToUpdate) {
        return res.status(400).send({ error: "Invalid updates" })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove()
        return res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//For File Upload
const upload = multer({
    limits: {
        fileSize: 2097152
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(JPG|jpg|jpeg|png)$/)) {
            return callback(new Error('Please upload an image'))
        }

        callback(undefined, true)
    }
})

router.post('/users/me/avater', auth, upload.single('avater'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avater = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avater', auth, async (req, res) => {
    try {
        req.user.avater = undefined
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users/:id/avater', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.set('Content-Type', 'image/png')
        res.send(user.avater)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send('logged out successfully')
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('logged out successfully from all devices')
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
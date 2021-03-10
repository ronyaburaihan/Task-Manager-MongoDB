const express = require('express')
const Task = require('../models/task')
const router = new express.Router()

router.post('/tasks', async (req, res) => {
    const task = new Task(req.body)

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
})

router.get('/tasks', async (req, res) => {

    try {
        const task = await Task.find({})
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }

    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch(() => {
    //     res.status(500).send()
    // })
})

router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findById(_id)
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
    // Task.findById(_id).then((task) => {
    //     if (!task) {
    //         return res.status(400).send()
    //     }

    //     res.send(task)

    // }).catch(() => {
    //     res.status(500).send()
    // })
})

router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdates = ['completed', 'description']
    const isValidToUpdate = updates.every((update) => allowUpdates.includes(update))

    if (!isValidToUpdate) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        })

        if (!task) {
            return res.status(404).send({ error: 'Task not found' })
        }

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', async (req, res) => {

    try {
        const task = await Task.findByIdAndDelete(req.params.id)
        if (!task) {
            return res.status(404).send()
        }

        return res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router
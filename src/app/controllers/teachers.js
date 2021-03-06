const { age, date, graduation } = require('../../lib/utils')
const Teacher = require('../../models/Teacher')
const Intl = require('intl')

module.exports = {
  index(req, res) {
    let { filter, page, limit } = req.query

    page = page || 1
    limit = limit || 5
    let offset = limit * (page - 1)


    const params = {
      filter,
      page,
      limit,
      offset,
      callback(teachers) {

        const pagination = {
          total: Math.ceil(teachers[0].total / limit),
          page
        }
        return res.render('teachers/index', { teachers, pagination, filter })
      }
    }
    Teacher.paginate(params)
  },
  create(req, res) {
    return res.render('teachers/create')
  },
  async post(req, res) {
    try {
      const dados = Object.keys(req.body)

      for (dado of dados) {
        if (req.body[dado] == "") {
          return res.send('Preencha todos os dados')
        }
      }

      let { avatar_url, name, birth_date, education_level, class_type, subjects_taught, created_at } = req.body

      birth_date = date(birth_date).iso,
        education_level = graduation(education_level),
        created_at = date(Date.now()).iso

      const teacher = await Teacher.create({
        avatar_url,
        name,
        birth_date,
        education_level,
        class_type,
        subjects_taught,
        created_at
      })

      return res.render('create-edit-delete/create-edit')
    } catch (error) {
      console.log(error)
      return res.render('create-edit-delete/error')
    }

  },
  show(req, res) {
    Teacher.find(req.params.id, function (teacher) {
      if (!teacher) return res.send('Professor não encontrado')

      teacher.birth_date = age(teacher.birth_date)
      teacher.subjects_taught = teacher.subjects_taught.split(',')
      teacher.created_at = new Intl.DateTimeFormat('pt-BR').format(teacher.created_at)

      return res.render('teachers/show', { teacher })
    })
  },
  edit(req, res) {
    Teacher.find(req.params.id, function (teacher) {
      if (!teacher) return res.send('Professor não encontrado')

      teacher.birth_date = date(teacher.birth_date).iso

      return res.render('teachers/edit', { teacher })
    })
  },
  async update(req, res) {
    try {
      const dados = Object.keys(req.body)

      for (dado of dados) {
        if (req.body[dado] == "") {
          return res.send('Preencha todos os dados')
        }
      }

      let { avatar_url, name, birth_date, education_level, class_type, subjects_taught, id } = req.body

      birth_date = date(birth_date).iso
      education_level = graduation(education_level)

      await Teacher.update(id, {
        avatar_url,
        name,
        birth_date,
        education_level,
        class_type,
        subjects_taught
      })

      return res.render('create-edit-delete/create-edit')
    } catch (error) {
      console.log(error)
      return res.render('create-edit-delete/error')
    }

  },
  async delete(req, res) {
    try {
      await Teacher.delete(req.body.id)
      return res.render('create-edit-delete/delete')
    } catch (error) {
      console.log(error)
      return res.render('create-edit-delete/error')
    }

  }
}
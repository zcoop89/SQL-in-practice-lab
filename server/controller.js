require("dotenv").config();
const Sequelize = require("sequelize");
const { CONNECTION_STRING } = process.env;
const sequelize = new Sequelize(CONNECTION_STRING, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

let nextEmp = 5;

module.exports = {
  getUpcomingAppointments: (req, res) => {
    sequelize
      .query(
        `select a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = false
        order by a.date desc;`
      )
      .then((dbRes) => res.status(200).send(dbRes[0]))
      .catch((err) => console.log(err));
  },

  approveAppointment: (req, res) => {
    let { apptId } = req.body;

    sequelize
      .query(
        `UPDATE cc_appointments SET approved = true
        WHERE appt_id = ${apptId}
        
        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `
      )
      .then((dbRes) => {
        res.status(200).send(dbRes[0]);
        nextEmp += 2;
      })
      .catch((err) => console.log(err));
  },

  getAllClients: (req, res) => {
    sequelize
      .query(
        `SELECT * FROM cc_clients c JOIN cc_users u ON c.user_id = u.user_id`
      )
      .then((dbres) => {
        res.status(200).send(dbres[0]);
      })
      .catch((err) => console.log(err));
  },

  getPendingAppointments: (req, res) => {
    sequelize
      .query(
        `SELECT * FROM cc_appointments WHERE approved=true order by date desc;`
      )
      .then((dbres) => {
        res.status(200).send(dbres[0]);
      });
  },

  getPastAppointments: (req, res) => {
    sequelize
      .query(
        `select a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
    from cc_appointments a
    join cc_emp_appts ea on a.appt_id = ea.appt_id
    join cc_employees e on e.emp_id = ea.emp_id
    join cc_users u on e.user_id = u.user_id
    where a.approved = true and a.completed = true
    order by a.date desc;`
      )
      .then((dbres) => {
        res.status(200).send(dbres[0]);
      });
  },

  completeAppointment: (req, res) => {
    let { apptId } = req.body;

    sequelize
      .query(
        `UPDATE cc_appointments SET completed = true
        WHERE appt_id = ${apptId}
        
        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `
      )
      .then((dbRes) => {
        res.status(200).send(dbRes[0]);
        nextEmp += 2;
      })
      .catch((err) => console.log(err));
  },
};

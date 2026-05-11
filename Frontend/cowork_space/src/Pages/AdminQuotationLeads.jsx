import React, {
  useEffect,
  useState
} from "react";

import axiosInstance
from "../Services/Axios";

import styles
from "../Styles/AdminDashboard.module.css";

export default function
AdminQuotationLeads() {

  const [leads, setLeads] =
    useState([]);

  const fetchLeads = () => {

    axiosInstance

      .get(
        "leads/admin/quotation-leads/"
      )

      .then((res) => {

        setLeads(res.data);

      })

      .catch((err) => {

        console.log(err);

      });

  };

  useEffect(() => {

    fetchLeads();

  }, []);

  const updateStatus = (
    id,
    status
  ) => {

    axiosInstance.patch(

      `leads/admin/quotation-leads/${id}/status/`,

      {
        status
      }

    )

    .then(() => {

      fetchLeads();

    })

    .catch((err) => {

      console.log(err);

    });

  };

  return (

    <div
      className={styles.tableWrap}
    >

      <table
        className={styles.table}
      >

        <thead>

          <tr>

            <th>Name</th>

            <th>Phone</th>

            <th>Email</th>

            <th>Company</th>

            <th>Location</th>

            <th>Owner</th>

            <th>Workspace</th>

            <th>Units</th>

            <th>Total</th>

            <th>Status</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {leads.map((item) => (

            <tr key={item.id}>

              <td>{item.name}</td>

              <td>{item.phone}</td>

              <td>{item.email}</td>

              <td>
                {item.company || "-"}
              </td>

              <td>
                {item.preferred_location}
              </td>

              <td>
                {item.owner_name}
              </td>

              <td>
                {item.workspace_type}
              </td>

              <td>

                {item.quotation_details
                ?.map(
                  (q) => q.units
                )
                .join(", ")}

              </td>

              <td>
                ₹{item.total_amount}
              </td>

              <td>

                <span
                  className={
                    styles.statusPill
                  }
                >

                  {item.status}

                </span>

              </td>

              <td>

                <select

                  value={item.status}

                  onChange={(e) =>

                    updateStatus(

                      item.id,

                      e.target.value

                    )

                  }

                  className={
                    styles.statusSelect
                  }

                >

                  <option
                    value="pending"
                  >
                    Pending
                  </option>

                  <option
                    value="contacted"
                  >
                    Contacted
                  </option>

                  <option
                    value="closed"
                  >
                    Closed
                  </option>

                </select>

              </td>

            </tr>

          ))}

          {leads.length === 0 && (

            <tr>

              <td
                colSpan="11"
                style={{
                  textAlign:
                  "center"
                }}
              >

                No Quotation
                Leads Found

              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

  );

}
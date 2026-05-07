import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import axiosInstance from "../Services/Axios";

import styles from "./AdminOfferLeads.module.css";

function AdminOfferLeads() {

  const { id } = useParams();

  const [leads, setLeads] =
    useState([]);

  const fetchLeads = () => {

    axiosInstance
      .get(
        `leads/offers/admin/leads/${id}/`
      )

      .then((res) => {

        setLeads(
          Array.isArray(res.data)
            ? res.data
            : []
        );
      })

      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = (
    leadId,
    status
  ) => {

    axiosInstance
      .put(
        `offers/leads/status/${leadId}/`,
        { status }
      )

      .then(() => {

        fetchLeads();

      })

      .catch((err) => {
        console.error(err);
      });
  };

  return (

    <div className={styles.wrapper}>

      <div className={styles.header}>

        <h2>
          🔥 Offer Workspace Leads
        </h2>

        <p>
          Admin tracking all
          offer leads
        </p>

      </div>

      <div className={styles.tableWrap}>

        <table className={styles.table}>

          <thead>

            <tr>

              <th>#</th>

              <th>Owner</th>

              <th>Workspace</th>

              <th>Location</th>

              <th>Name</th>

              <th>Phone</th>

              <th>Email</th>

              <th>Team Size</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {leads.map(
              (item, index) => (

                <tr key={item.id}>

                  <td>
                    {index + 1}
                  </td>

                  <td>
                    {
                      item.owner_name
                    }
                  </td>

                  <td>
                    {
                      item.workspace_type
                    }
                  </td>

                  <td>
                    {
                      item.preferred_location
                    }
                  </td>

                  <td>
                    {item.name}
                  </td>

                  <td>
                    {item.phone}
                  </td>

                  <td>
                    {item.email}
                  </td>

                  <td>
                    {item.team_size}
                  </td>

                  <td>

                    <span
                      className={
                        styles.status
                      }
                    >
                      {item.status}
                    </span>

                  </td>

                  <td>

                    <select
                      value={
                        item.status
                      }
                      onChange={(e) =>
                        updateStatus(
                          item.id,
                          e.target.value
                        )
                      }
                    >

                      <option value="New">
                        New
                      </option>

                      <option value="Contacted">
                        Contacted
                      </option>

                      <option value="Interested">
                        Interested
                      </option>

                      <option value="Converted">
                        Converted
                      </option>

                    </select>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminOfferLeads;
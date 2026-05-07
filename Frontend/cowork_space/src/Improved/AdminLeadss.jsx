import { useEffect, useState } from "react";
import axiosInstance from "../Services/Axios";
import styles from "./AdminLeadss.module.css";

function AdminOfferWorkspace() {

  const [offers, setOffers] = useState([]);

  const [formData, setFormData] = useState({
    area: "",
    building: "",
    type: "",
    original_price: "",
    offer_price: "",
    seats: "",
    floor: "",
    image: "",
  });

  const [editId, setEditId] = useState(null);

  const fetchOffers = () => {

    axiosInstance
      .get("workspaces/offers/admin/")

      .then((res) => {

        setOffers(
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
    fetchOffers();
  }, []);

  const handleSubmit = () => {

    if (
      !formData.area ||
      !formData.building ||
      !formData.type
    ) {
      alert("Fill all fields");
      return;
    }

    if (editId) {

      axiosInstance
        .put(
          `workspaces/offers/update/${editId}/`,
          formData
        )

        .then(() => {

          alert("Updated Successfully");

          fetchOffers();

          resetForm();

        })

        .catch((err) => {
          console.error(err);
        });

    } else {

      axiosInstance
        .post(
          "workspaces/offers/create/",
          formData
        )

        .then(() => {

          alert("Created Successfully");

          fetchOffers();

          resetForm();

        })

        .catch((err) => {
          console.error(err);
        });
    }
  };

  const resetForm = () => {

    setFormData({
      area: "",
      building: "",
      type: "",
      original_price: "",
      offer_price: "",
      seats: "",
      floor: "",
      image: "",
    });

    setEditId(null);
  };

  const handleEdit = (item) => {

    setFormData({
      area: item.area,
      building: item.building,
      type: item.type,
      original_price: item.original_price,
      offer_price: item.offer_price,
      seats: item.seats,
      floor: item.floor,
      image: item.image,
    });

    setEditId(item.id);
  };

  const handleDelete = (id) => {

    if (
      !window.confirm(
        "Delete this workspace?"
      )
    )
      return;

    axiosInstance
      .delete(
        `workspaces/offers/delete/${id}/`
      )

      .then(() => {

        fetchOffers();

      })

      .catch((err) => {
        console.error(err);
      });
  };

  const handleApprove = (id) => {

    axiosInstance
      .put(
        `workspaces/offers/approve/${id}/`
      )

      .then(() => {

        fetchOffers();

      })

      .catch((err) => {
        console.error(err);
      });
  };

  return (

    <div className={styles.wrapper}>

      <div className={styles.formCard}>

        <h2>
          🔥 Admin Offer Workspaces
        </h2>

        <div className={styles.formGrid}>

          <div className={styles.field}>
            <label>Location</label>

            <select
              value={formData.area}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  area: e.target.value,
                })
              }
            >
              <option value="">
                Select Location
              </option>

              <option value="Hitech City">
                Hitech City
              </option>

              <option value="Madhapur">
                Madhapur
              </option>

              <option value="Gachibowli">
                Gachibowli
              </option>

              <option value="Kondapur">
                Kondapur
              </option>

            </select>
          </div>

          <div className={styles.field}>
            <label>Building</label>

            <input
              value={formData.building}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  building:
                    e.target.value,
                })
              }
            />
          </div>

          <div className={styles.field}>
            <label>Workspace Type</label>

            <input
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value,
                })
              }
            />
          </div>

          <div className={styles.field}>
            <label>Original Price</label>

            <input
              type="number"
              value={
                formData.original_price
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  original_price:
                    e.target.value,
                })
              }
            />
          </div>

          <div className={styles.field}>
            <label>Offer Price</label>

            <input
              type="number"
              value={
                formData.offer_price
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  offer_price:
                    e.target.value,
                })
              }
            />
          </div>

          <div className={styles.field}>
            <label>Seats</label>

            <input
              type="number"
              value={formData.seats}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seats: e.target.value,
                })
              }
            />
          </div>

          <div className={styles.field}>
            <label>Floor</label>

            <input
              value={formData.floor}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  floor: e.target.value,
                })
              }
            />
          </div>

          <div className={styles.field}>
            <label>Image URL</label>

            <input
              value={formData.image}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  image: e.target.value,
                })
              }
            />
          </div>

        </div>

        <div className={styles.btnRow}>

          <button
            className={styles.addBtn}
            onClick={handleSubmit}
          >
            {editId
              ? "Update Workspace"
              : "Add Workspace"}
          </button>

          {editId && (
            <button
              className={styles.cancelBtn}
              onClick={resetForm}
            >
              Cancel
            </button>
          )}

        </div>

      </div>

      <div className={styles.tableWrap}>

        <table className={styles.table}>

          <thead>

            <tr>
              <th>#</th>
              <th>Owner</th>
              <th>Location</th>
              <th>Building</th>
              <th>Type</th>
              <th>Original</th>
              <th>Offer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {offers.map(
              (item, index) => (

                <tr key={item.id}>

                  <td>
                    {index + 1}
                  </td>

                  <td>
                    {item.owner_name}
                  </td>

                  <td>
                    {item.area}
                  </td>

                  <td>
                    {item.building}
                  </td>

                  <td>
                    {item.type}
                  </td>

                  <td>
                    ₹
                    {item.original_price}
                  </td>

                  <td>
                    ₹
                    {item.offer_price}
                  </td>

                  <td>

                    {item.is_approved ? (
                      <span
                        className={
                          styles.approved
                        }
                      >
                        Approved
                      </span>
                    ) : (
                      <span
                        className={
                          styles.pending
                        }
                      >
                        Pending
                      </span>
                    )}

                  </td>

                  <td>

                    <div
                      className={
                        styles.actionBtns
                      }
                    >

                      <button
                        className={
                          styles.editBtn
                        }
                        onClick={() =>
                          handleEdit(
                            item
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className={
                          styles.deleteBtn
                        }
                        onClick={() =>
                          handleDelete(
                            item.id
                          )
                        }
                      >
                        Delete
                      </button>

                      {!item.is_approved && (
                        <button
                          className={
                            styles.approveBtn
                          }
                          onClick={() =>
                            handleApprove(
                              item.id
                            )
                          }
                        >
                          Approve
                        </button>

                      )}
                            <button
  className={
    styles.leadsBtn
  }
  onClick={() =>
    window.open(
      `/admin-offer-leads/${item.id}`,
      "_blank"
    )
  }
>
  View Leads
</button>

                    </div>

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

export default AdminOfferWorkspace;
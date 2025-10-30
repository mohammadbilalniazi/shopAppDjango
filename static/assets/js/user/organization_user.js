// === Utility Functions ===
const $ = (id) => document.getElementById(id);

const csrfHeaders = (extra = {}) => ({
  "X-CSRFToken": getCookie("csrftoken"),
  ...extra,
});

// === Form Handling ===
const organizationUserForm = $("organization_user_form");

organizationUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = $("id");
  const organization = $("organization");
  const img = $("img");
  const firstName = $("first_name");
  const lastName = $("last_name");
  const username = $("username");
  const password = $("password");
  const role = $("role");

  if (!id.value) id.value = null;

  const formData = new FormData();
  formData.append("id", id.value);
  formData.append("first_name", firstName.value);
  formData.append("last_name", lastName.value);
  formData.append("organization", organization.value);
  formData.append("role", role.value);
  formData.append("username", username.value);
  formData.append("password", password.value);

  if (img.files[0]) {
    formData.append("img", img.files[0]);
  }

  const url = organizationUserForm.action;
  const headers = csrfHeaders({ "Content-Type": "multipart/form-data" });

  const response = await call_shirkat(url, "POST", formData, headers);
  console.log("res", response);

  if ([200, 201].includes(response.status)) {
    if (response.data) {
      show_message("User Saved", "success");
      id.value = response.data.id;

      // redirect after 5 seconds
      setTimeout(() => {
        window.location.href = `/user/organization_user/add/${id.value}`;
      }, 5000);
    } else {
      show_message(response.data.message, "error");
    }
  } else {
    show_message("User Not Created", "error");
  }
});

// === Search & Pagination ===
async function search(url = "/user/organization_user/search/") {
  const data = { is_paginate: 1 };
  const organization = $("organization").value;
  const firstName = $("first_name").value;
  const lastName = $("last_name").value;
  const username = $("username").value;
  const searchInput = $("search_user_input");
  const searchTerm = searchInput ? searchInput.value : "";

  if (organization) data.organization = organization;
  
  // If search input has value, use it for all search fields
  if (searchTerm) {
    data.first_name = searchTerm;
    data.last_name = searchTerm;
    data.username = searchTerm;
  } else {
    // Otherwise use individual field values
    if (firstName) data.first_name = firstName;
    if (lastName) data.last_name = lastName;
    if (username) data.username = username;
  }

  const response = await call_shirkat(url, "POST", data, csrfHeaders());
  console.log("search res", response);

  if ([200, 201].includes(response.status) && response.data) {
    const { previous, next, results} =
      response.data;
    serializer_data=results['serializer_data']
    // if (serializer_data.length === 0) {
    //   return;
    // }

    const tbody = document.querySelector("#organization_user_body");
    const pagination = document.querySelector("#pagination_id");

    // clear table & pagination
    tbody.innerHTML = "";
    pagination.innerHTML = "";

    if (previous) {
      pagination.insertAdjacentHTML(
        "beforeend",
        `<tr><td><a href="${previous}" class="btn btn-success" data-url="${previous}" onclick="handlePaginationClick(event)">Previous</a></td></tr>`
      );
    }

    if (next) {
      pagination.insertAdjacentHTML(
        "beforeend",
        `<tr><td><a href="${next}" class="btn btn-success" data-url="${next}" onclick="handlePaginationClick(event)">Next</a></td></tr>`
      );
    }
    console.log("serializer_data", serializer_data);
    // render rows
    for (const user of serializer_data) {
      const row = `
        <tr>
          <td>${user.organization}</td>
          <td>${user.username}</td>
          <td>${user.first_name}</td>
          <td>${user.last_name}</td>
          <td>${user.role}</td>
          <td><img src="${user.img || "/static/default.png"}" width="80" height="80"/></td>
          <td>
            <a href="/user/organization_user/add/${user.id}" class="btn btn-success">Update</a>
            <a class="btn btn-danger" onclick="deleteOrganizationUser(${user.id});return false">Delete</a>
          </td>
        </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    }
  }
}

function handlePaginationClick(event) {
  event.preventDefault();
  const url = event.currentTarget.dataset.url;
  search(url);
}

// === Delete User ===
async function deleteOrganizationUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  const url = `/user/organization_user/delete/${id}`;
  const response = await call_shirkat(url, "DELETE", {}, csrfHeaders());

  console.log("delete res", response);

  if (response.status === 204) {
    show_message("User Deleted", "success");
    search();
  } else {
    show_message("User Not Deleted", "error");
  }
}

// Run initial search
search();

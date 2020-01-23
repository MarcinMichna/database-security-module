const card = document.querySelector(".card-body");

const getUserQuery = () => {
  return document.getElementById("userQuery").value;
};

const getCheckedRole = () => {
  return document.querySelector(`input[name="groupOfDefaultRadios"]:checked`)
    .value;
};

const sendBtn = document.getElementById("submitBtn");
sendBtn.addEventListener("click", e => {
  // uncomment below if when you want just one reply
  if (card.childElementCount > 1) {
    card.removeChild(card.lastElementChild);
  }

  e.preventDefault();

  card.insertAdjacentHTML("beforeend", `<div class="loader"></div>`);

  const userQuery = getUserQuery();
  const checkedRole = getCheckedRole();

  fetch("http://localhost:3000/something", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },

    //serialize your JSON body
    body: JSON.stringify({
      userQuery,
      checkedRole
    })
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log(data);
      // const stringifyJSON = JSON.stringify(data);
      // console.log(stringifyJSON);
      // card.insertAdjacentHTML("beforeend", stringifyJSON);
      let prepareHeader = "";
      let prepareBody = "";

      const keys = Object.keys(data[0]);
      for (let k of keys) {
        prepareHeader += `<th>${k}</th>`;
      }

      for (let d of data) {
        const values = Object.values(d);

        prepareBody += "<tr>";
        for (let v of values) {
          prepareBody += `<td>${v}</td>`;
        }
        prepareBody += "</tr>";
      }

      // for (d of data) {
      //   prepare += `<tr><td>${d.id === undefined ? "" : d.id}</td>
      //   <td>${d.name === undefined ? "" : d.name}</td>
      //   <td>${d.description === undefined ? "" : d.description}</td>
      //   <td>${d.price === undefined ? "" : d.price}</td>
      //   <th>${d.orderId === undefined ? "" : d.orderId}</th></tr>`;
      // }

      if (card.childElementCount > 1) {
        card.removeChild(card.lastElementChild);
      }
      card.insertAdjacentHTML(
        "beforeend",
        `<div><label style="color: #757575;" class="font-weight-bold text-center">Response From Server</label>
        <!-- Reply -->
        <div class="text-center">
          <table stle="width:100%">
          <tr>
            ${prepareHeader}
          </tr>
            ${prepareBody}
        </table>
        </div></div>`
      );
    })
    .catch(err => {
      if (card.childElementCount > 1) {
        card.removeChild(card.lastElementChild);
      }

      card.insertAdjacentHTML(
        "beforeend",
        `<div><label style="color: #757575;" class="font-weight-bold text-center">Response From Server</label>
        <!-- Reply -->
        <div class="text-center">
          <p><strong>Error</strong>: Your query was empty or invalid</p>
        </div></div>`
      );
    });
});

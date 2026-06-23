import React, { useState } from "react";
import "./portal.css";

const PortalPage = () => {
  const [openCategories, setOpenCategories] = useState(["cat1"]);

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="portal-container">
      <div className="portal-header">
        <div className="header-top-row">
          <div className="portal-title-container">
            <span className="portal-title-icon">{/* svg */}</span>

            <span className="portal-h2">سامانه‌های سازمانی پرشیاخودرو</span>

            <span className="portal-h2">Persia ERP</span>
          </div>
        </div>

        <p>دسترسی به تمامی سیستم‌ها و پرتال‌های داخلی</p>
      </div>

      <div
        className={`category-group ${
          openCategories.includes("cat1") ? "is-open" : ""
        }`}
      >
        <div className="category-header" onClick={() => toggleCategory("cat1")}>
          <span className="category-title">فروش خودرو</span>
        </div>

        {openCategories.includes("cat1") && (
          <div className="category-content">
            <div className="portal-grid">
              <a className="portal-card" href="http://172.16.10.22/">
                <span className="card-title">فروش خودروی پرشیا خودرو</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalPage;

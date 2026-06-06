import React from "react";

// Individual Product Card Skeleton
export function CardSkeleton() {
  return (
    <div className="card border-0 shadow-sm w-100 placeholder-glow" style={{ borderRadius: "12px", overflow: "hidden" }}>
      <div className="placeholder w-100 bg-secondary-subtle" style={{ height: "240px" }}></div>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="placeholder col-3 bg-secondary-subtle" style={{ height: "12px" }}></span>
          <span className="placeholder col-2 bg-secondary-subtle" style={{ height: "12px" }}></span>
        </div>
        <h5 className="card-title mb-2">
          <span className="placeholder col-8 bg-secondary-subtle" style={{ height: "16px" }}></span>
          <span className="placeholder col-5 bg-secondary-subtle" style={{ height: "16px", marginTop: "8px" }}></span>
        </h5>
        <div className="mt-4 pt-3 border-top border-light d-flex justify-content-between align-items-center">
          <span className="placeholder col-4 bg-secondary-subtle" style={{ height: "20px" }}></span>
          <span className="placeholder rounded-circle bg-secondary-subtle" style={{ width: "38px", height: "38px" }}></span>
        </div>
      </div>
    </div>
  );
}

// Product Grid Skeleton
export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}

// Product Details Page Skeleton
export function DetailsSkeleton() {
  return (
    <div className="container py-5 placeholder-glow">
      <div className="row g-5">
        {/* Gallery Column */}
        <div className="col-lg-6">
          <div className="placeholder w-100 bg-secondary-subtle mb-3 rounded" style={{ height: "450px" }}></div>
          <div className="row g-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="col-4">
                <div className="placeholder w-100 bg-secondary-subtle rounded" style={{ height: "100px" }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div className="col-lg-6">
          <span className="placeholder col-3 bg-secondary-subtle mb-2 d-inline-block" style={{ height: "14px" }}></span>
          <h1 className="placeholder col-10 bg-secondary-subtle mb-3 d-block" style={{ height: "36px" }}></h1>
          <div className="placeholder col-4 bg-secondary-subtle mb-4" style={{ height: "18px" }}></div>
          
          <hr className="my-4" />

          <div className="placeholder col-3 bg-secondary-subtle mb-2" style={{ height: "28px" }}></div>
          <div className="placeholder col-6 bg-secondary-subtle mb-4" style={{ height: "16px" }}></div>

          <hr className="my-4" />

          {/* Color & Size mock selectors */}
          <div className="mb-4">
            <span className="placeholder col-2 bg-secondary-subtle mb-2 d-block" style={{ height: "14px" }}></span>
            <div className="d-flex gap-2">
              {[1, 2, 3].map((i) => (
                <span key={i} className="placeholder rounded-circle bg-secondary-subtle" style={{ width: "36px", height: "36px" }}></span>
              ))}
            </div>
          </div>

          <div className="d-flex gap-3 mt-5">
            <span className="placeholder col-4 bg-secondary-subtle rounded" style={{ height: "48px" }}></span>
            <span className="placeholder col-6 bg-secondary-subtle rounded" style={{ height: "48px" }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

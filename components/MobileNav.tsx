export default function MobileNav() {
  return (
    <nav id="nav-mobile" aria-label="Sections">
      <div id="nav-mobile-bar">
        <span />
      </div>

      <div id="nav-mobile-bottom">
        <button
          type="button"
          id="nav-prev"
          className="nav-mobile-paren"
          aria-label="Previous section"
        >
          (
        </button>

        <div id="nav-mobile-items">
          <span id="nav-mobile-title">Intro</span>
        </div>

        <button
          type="button"
          id="nav-next"
          className="nav-mobile-paren"
          aria-label="Next section"
        >
          )
        </button>
      </div>
    </nav>
  );
}

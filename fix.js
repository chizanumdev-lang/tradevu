const fs = require('fs');
let content = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

// Find where Dropdown ends
const dropdownEndIdx = content.indexOf(`              {value === opt && <Check size={12} className="text-slate-900 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );`);

if (dropdownEndIdx !== -1) {
  // Extract up to the end of the Dropdown return statement
  const goodContent = content.substring(0, dropdownEndIdx) + `              {value === opt && <Check size={12} className="text-slate-900 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
`;
  fs.writeFileSync('src/app/admin/page.tsx', goodContent);
  console.log("Fixed successfully");
} else {
  console.log("Could not find dropdown end");
}

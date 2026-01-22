import { useTranslation } from 'react-i18next'
import { useStore, selectFocusedPerson } from '../../store'
import { getDisplayName, getLifeSpan } from '../../types/individual'
import { Button } from '../ui/Button'

export function PersonInfo() {
  const { t } = useTranslation()
  const person = useStore(selectFocusedPerson)
  const { centerOnNode } = useStore((state) => state.viewport)
  const gedcomData = useStore((state) => state.gedcom.data)
  const { setFocusedPerson } = useStore((state) => state.selection)

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="mb-4 h-16 w-16 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <p className="font-body text-body text-text-muted">
          {t('personInfo.selectPerson')}
        </p>
      </div>
    )
  }

  // Get family information
  const families = person.familyAsSpouse
    .map((famId) => gedcomData?.families.get(famId))
    .filter(Boolean)

  const parentFamily = person.familyAsChild
    ? gedcomData?.families.get(person.familyAsChild)
    : null

  const handlePersonClick = (personId: string) => {
    setFocusedPerson(personId)
    centerOnNode(personId)
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'M': return t('personInfo.male')
      case 'F': return t('personInfo.female')
      default: return t('personInfo.unknown')
    }
  }

  return (
    <div className="space-y-6 px-1 pb-4">
      {/* Photo placeholder */}
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-bg-aged">
        <svg
          className="h-12 w-12 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>

      {/* Name */}
      <div className="text-center">
        <h2 className="font-display text-h2 text-text-primary">
          {getDisplayName(person)}
        </h2>
        <p className="font-body text-small text-text-muted">
          {getLifeSpan(person)}
        </p>
        <p className="font-body text-small text-text-muted">
          {getGenderLabel(person.gender)} • ID: {person.id}
        </p>
      </div>

      {/* Birth */}
      {person.birth && (person.birth.date || person.birth.place) && (
        <section>
          <h3 className="mb-2 font-body text-h3 text-text-primary">{t('personInfo.birth')}</h3>
          <div className="rounded-lg bg-white p-3 dark:bg-bg-canvas">
            {person.birth.date && (
              <p className="font-body text-body text-text-primary">{person.birth.date}</p>
            )}
            {person.birth.place && (
              <p className="font-body text-small text-text-secondary">{person.birth.place}</p>
            )}
          </div>
        </section>
      )}

      {/* Death */}
      {person.isDeceased && (
        <section>
          <h3 className="mb-2 font-body text-h3 text-text-primary">{t('personInfo.death')}</h3>
          <div className="rounded-lg bg-white p-3 dark:bg-bg-canvas">
            {person.death?.date ? (
              <>
                <p className="font-body text-body text-text-primary">{person.death.date}</p>
                {person.death.place && (
                  <p className="font-body text-small text-text-secondary">{person.death.place}</p>
                )}
              </>
            ) : (
              <p className="font-body text-body text-text-muted">{t('personInfo.dateUnknown')}</p>
            )}
          </div>
        </section>
      )}

      {/* Occupation */}
      {person.occupation && person.occupation.length > 0 && (
        <section>
          <h3 className="mb-2 font-body text-h3 text-text-primary">{t('personInfo.occupation')}</h3>
          <div className="space-y-2">
            {person.occupation.map((occ, i) => (
              <div key={i} className="rounded-lg bg-white p-3 dark:bg-bg-canvas">
                <p className="font-body text-body text-text-primary">{occ.value}</p>
                {occ.date && (
                  <p className="font-body text-small text-text-secondary">{occ.date}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {person.education && person.education.length > 0 && (
        <section>
          <h3 className="mb-2 font-body text-h3 text-text-primary">{t('personInfo.education')}</h3>
          <div className="space-y-2">
            {person.education.map((edu, i) => (
              <div key={i} className="rounded-lg bg-white p-3 dark:bg-bg-canvas">
                <p className="font-body text-body text-text-primary">{edu.value}</p>
                {edu.date && (
                  <p className="font-body text-small text-text-secondary">{edu.date}</p>
                )}
                {edu.place && (
                  <p className="font-body text-small text-text-muted">{edu.place}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Info */}
      {(person.email || person.phone || person.residence?.address) && (
        <section>
          <h3 className="mb-2 font-body text-h3 text-text-primary">{t('personInfo.contact')}</h3>
          <div className="rounded-lg bg-white p-3 space-y-1 dark:bg-bg-canvas">
            {person.email && (
              <p className="font-body text-small text-text-primary">{person.email}</p>
            )}
            {person.phone && (
              <p className="font-body text-small text-text-primary">{person.phone}</p>
            )}
            {person.residence?.address && (
              <p className="font-body text-small text-text-secondary">
                {[
                  person.residence.address.line1,
                  person.residence.address.city,
                  person.residence.address.state,
                  person.residence.address.country
                ].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Religion & Nationality */}
      {(person.religion || person.nationality) && (
        <section>
          <h3 className="mb-2 font-body text-h3 text-text-primary">{t('personInfo.details')}</h3>
          <div className="rounded-lg bg-white p-3 space-y-1 dark:bg-bg-canvas">
            {person.religion && (
              <p className="font-body text-small text-text-primary">
                <span className="text-text-muted">{t('personInfo.religion')}:</span> {person.religion}
              </p>
            )}
            {person.nationality && (
              <p className="font-body text-small text-text-primary">
                <span className="text-text-muted">{t('personInfo.nationality')}:</span> {person.nationality}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Custom Events (Hobbies, Languages, etc.) */}
      {person.events && person.events.length > 0 && (
        <section>
          <h3 className="mb-2 font-body text-h3 text-text-primary">{t('personInfo.interests')}</h3>
          <div className="space-y-2">
            {person.events.map((event, i) => (
              <div key={i} className="rounded-lg bg-white p-3 dark:bg-bg-canvas">
                <p className="font-body text-small text-text-muted">{event.type}</p>
                <p className="font-body text-body text-text-primary">{event.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {person.notes && person.notes.length > 0 && (
        <section>
          <h3 className="mb-2 font-body text-h3 text-text-primary">{t('personInfo.notes')}</h3>
          <div className="rounded-lg bg-white p-3 dark:bg-bg-canvas">
            <p className="font-body text-small text-text-secondary whitespace-pre-wrap">
              {person.notes[0].replace(/<[^>]*>/g, '')}
            </p>
          </div>
        </section>
      )}

      {/* Parents */}
      {parentFamily && (
        <section>
          <h3 className="mb-2 font-body text-h3 text-text-primary">{t('personInfo.parents')}</h3>
          <div className="space-y-2">
            {parentFamily.husband && (
              <button
                onClick={() => handlePersonClick(parentFamily.husband!)}
                className="w-full rounded-lg bg-white p-3 text-start hover:bg-bg-aged transition-colors dark:bg-bg-canvas"
              >
                <p className="font-body text-body text-text-primary">
                  {gedcomData?.individuals.get(parentFamily.husband)?.name.full || t('personInfo.unknown')}
                </p>
                <p className="font-body text-small text-text-muted">{t('personInfo.father')}</p>
              </button>
            )}
            {parentFamily.wife && (
              <button
                onClick={() => handlePersonClick(parentFamily.wife!)}
                className="w-full rounded-lg bg-white p-3 text-start hover:bg-bg-aged transition-colors dark:bg-bg-canvas"
              >
                <p className="font-body text-body text-text-primary">
                  {gedcomData?.individuals.get(parentFamily.wife)?.name.full || t('personInfo.unknown')}
                </p>
                <p className="font-body text-small text-text-muted">{t('personInfo.mother')}</p>
              </button>
            )}
          </div>
        </section>
      )}

      {/* Spouses and Children */}
      {families.map((family, familyIndex) => {
        if (!family) return null
        const spouseId = family.husband === person.id ? family.wife : family.husband
        const spouse = spouseId ? gedcomData?.individuals.get(spouseId) : null

        return (
          <section key={family.id}>
            <h3 className="mb-2 font-body text-h3 text-text-primary">
              {t('personInfo.family')} {families.length > 1 ? familyIndex + 1 : ''}
            </h3>

            {/* Spouse */}
            {spouse && (
              <div className="mb-2">
                <button
                  onClick={() => handlePersonClick(spouse.id)}
                  className="w-full rounded-lg bg-white p-3 text-start hover:bg-bg-aged transition-colors dark:bg-bg-canvas"
                >
                  <p className="font-body text-body text-text-primary">{spouse.name.full}</p>
                  <p className="font-body text-small text-text-muted">
                    {t('personInfo.spouse')}{family.marriage?.date ? ` • ${t('personInfo.married')} ${family.marriage.date}` : ''}
                  </p>
                </button>
              </div>
            )}

            {/* Children */}
            {family.children.length > 0 && (
              <div className="space-y-2">
                {family.children.map((childId) => {
                  const child = gedcomData?.individuals.get(childId)
                  if (!child) return null
                  return (
                    <button
                      key={childId}
                      onClick={() => handlePersonClick(childId)}
                      className="w-full rounded-lg bg-white p-3 text-start hover:bg-bg-aged transition-colors dark:bg-bg-canvas"
                    >
                      <p className="font-body text-body text-text-primary">{child.name.full}</p>
                      <p className="font-body text-small text-text-muted">{t('personInfo.child')}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}

      {/* Center on person button */}
      <div className="pt-4">
        <Button
          onClick={() => centerOnNode(person.id)}
          variant="secondary"
          className="w-full"
        >
          <svg className="h-4 w-4 me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {t('personInfo.centerOnPerson')}
        </Button>
      </div>
    </div>
  )
}

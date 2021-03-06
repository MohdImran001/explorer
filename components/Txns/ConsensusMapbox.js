import ReactMapboxGl, { Marker, ZoomControl } from 'react-mapbox-gl'
import { findBounds } from './utils'
import animalHash from 'angry-purple-tiger'
import { Tooltip, Button } from 'antd'
import ReactCountryFlag from 'react-country-flag'
import { useRouter } from 'next/router'
import useDeepCompareEffect from 'use-deep-compare-effect'
import { useState } from 'react'
import { ReloadOutlined } from '@ant-design/icons'

const Mapbox = ReactMapboxGl({
  scrollZoom: false,
})

const styles = {
  consensusMember: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: '#A667F6',
    display: 'flex',
    border: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 4px 0px rgba(0,0,0,0.5)',
    cursor: 'pointer',
  },
}

const ConsensusMapbox = ({ members }) => {
  const router = useRouter()

  const [mapBounds, setMapBounds] = useState(
    findBounds(members.map((m) => ({ lng: m?.lng, lat: m?.lat }))),
  )

  const calculateBounds = () => {
    const memberLocations = []
    members.map((m) => memberLocations.push({ lng: m?.lng, lat: m?.lat }))
    setMapBounds(findBounds(memberLocations))
  }

  useDeepCompareEffect(() => {
    // only recalculate bounds if the consensus group changes (requires looking deeply at–i.e. comparing each item in—the dependency array)
    // otherwise (with a regular useEffect()) this would recalculate every time the data refreshes, resetting the user's zoom and pan every 10 seconds
    calculateBounds()
  }, [members])

  return (
    <Mapbox
      style="https://api.maptiler.com/maps/2469a8ae-f7e5-4ed1-b856-cd312538e33b/style.json?key=kNomjOqCRi7kEjO4HbFF"
      container="map"
      containerStyle={{
        height: '600px',
        width: '100%',
      }}
      fitBounds={mapBounds}
      fitBoundsOptions={{
        padding: 100,
        animate: false,
      }}
      movingMethod="jumpTo"
    >
      <ZoomControl
        style={{ zIndex: 5 }}
        position="bottom-right"
        className="consensus_map__zoom_buttons"
      />

      {members?.map((m, idx) => {
        return (
          <Tooltip
            title={
              <div className="flex flex-row items-center justify-start">
                {animalHash(m.address)}{' '}
                <ReactCountryFlag
                  countryCode={m.geocode.short_country}
                  svg
                  style={{
                    marginLeft: '6px',
                  }}
                />
              </div>
            }
          >
            <Marker
              key={m.address}
              style={styles.consensusMember}
              anchor="center"
              className="consensus-mapbox-marker"
              coordinates={[m?.lng, m?.lat]}
              onClick={() => router.push(`/hotspots/${m.address}`)}
            >
              <p
                className="consensus-mapbox-hover-text"
                style={{
                  color: 'white',
                  fontFamily: 'Inter',
                  fontWeight: 600,
                }}
              >
                {idx + 1}
              </p>
            </Marker>
          </Tooltip>
        )
      })}
      <div
        className="reset-zoom-button"
        style={{
          position: 'absolute',
          bottom: '10rem',
          right: '-0.5rem',
        }}
      >
        <Tooltip title={`Reset zoom and pan`} placement={'bottomRight'}>
          <Button
            type="secondary"
            shape="circle"
            size={'small'}
            onClick={() => calculateBounds()}
            icon={<ReloadOutlined />}
          ></Button>
        </Tooltip>
      </div>
    </Mapbox>
  )
}
export default ConsensusMapbox

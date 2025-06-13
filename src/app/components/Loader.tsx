import { type FunctionComponent } from 'react'
import { ClipLoader } from 'react-spinners'

type Props = {
    isLoading?: boolean
}

const Loader: FunctionComponent<Props> = ({ isLoading }) => {
    return (
        <div>
            <ClipLoader
                color='#36d7b7'
                loading={true}
                size={150}
                aria-label="Loading Spinner"
                data-testid="loader"
                className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            />
        </div>
    )
}

export default Loader
import React from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { LoaderHeightWidthRadiusProps } from 'react-spinners/interfaces';

export type Props = LoaderHeightWidthRadiusProps;
const Spinner = (p: Props) => {
	return (
		<ScaleLoader
			color="#24B9E1"
			loading={true}
			height={90}
			width={7}
			margin={12}
			{...p}
		/>
	);
};
export default Spinner;
